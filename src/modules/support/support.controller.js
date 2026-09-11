import prisma from "#config/prisma";
import { uploadFileToR2 } from "../../services/r2.service.js";

export const addTicketComment = async (req, res) => {
  try {
    const { ticketId, text, authorId, authorRole } = req.body;
    const files = req.files; // Archivos interceptados por Multer

    // 1. Subir todos los archivos a Cloudflare R2 en paralelo
    const attachmentsData = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileUrl = await uploadFileToR2(file);
        return {
          fileUrl,
          fileName: file.originalname,
          fileType: file.mimetype,
        };
      });

      // Esperamos a que todas las imágenes se suban
      const uploadedFiles = await Promise.all(uploadPromises);
      attachmentsData.push(...uploadedFiles);
    }

    // 2. Guardar el comentario y sus adjuntos en la Base de Datos
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { creator: true, assignedTech: true },
    });

    const newComment = await prisma.supportComment.create({
      data: {
        text,
        supportTicketId: ticketId,
        authorId,
        attachments: {
          create: attachmentsData, // Prisma crea los registros en SupportAttachment automáticamente
        },
      },
      include: { attachments: true },
    });

    // 3. LÓGICA DE PING-PONG (Notificaciones por WhatsApp)
    let targetPhone = "";
    let message = "";
    const hasFiles =
      attachmentsData.length > 0 ? "\n📎 *Adjuntó archivos*" : "";

    if (authorRole === "USER") {
      // EL PONG: Juan comentó -> Le avisamos a TI
      targetPhone =
        ticket.assignedTech?.whatsappPhone ||
        process.env.IT_SUPPORT_WHATSAPP_NUMBER;
      message = `💬 *Nueva observación de ${ticket.creator.name}*\n🎫 *Ticket:* #${ticket.folio}\n📝 *Dice:* "${text}"${hasFiles}`;
    } else if (authorRole === "TECH" || authorRole === "ADMIN") {
      // EL PING: TI comentó -> Le avisamos a Juan
      targetPhone = ticket.creator.whatsappPhone;
      message = `👨‍💻 *Soporte TI te ha respondido*\n🎫 *Ticket:* #${ticket.folio}\n📝 *Mensaje:* "${text}"${hasFiles}\n\nRevisa el sistema para ver los detalles.`;
    }

    // 4. Encolar el WhatsApp
    /*
    if (targetPhone) {
      await prisma.reminder.create({
        data: {
          userId: authorId,
          supportTicketId: ticketId,
          scheduledAt: new Date(),
          messagePayload: message,
          status: 'PENDING'
        }
      });
    }
    */

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("[Helpdesk] Error agregando comentario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      creatorId,
      categoryId,
      caseType,
      source,
      createdAt,
    } = req.body;
    const files = req.files;

    // Validación de seguridad
    if (!creatorId) {
      return res
        .status(400)
        .json({ success: false, error: "El solicitante es obligatorio." });
    }

    // 1. SUBIR ARCHIVOS A CLOUDFLARE R2 PRIMERO
    const attachmentsData = [];
    if (files && files.length > 0) {
      const uploadPromises = files.map(async (file) => {
        const fileUrl = await uploadFileToR2(file); // Subimos a la nube
        return {
          fileUrl, // Ahora sí tenemos la URL real
          fileName: file.originalname,
          fileType: file.mimetype,
        };
      });

      // Esperamos a que todas las imágenes se suban
      const uploadedFiles = await Promise.all(uploadPromises);
      attachmentsData.push(...uploadedFiles);
    }

    // 2. CREAR EL TICKET EN LA BASE DE DATOS
    const newTicket = await prisma.$transaction(async (tx) => {
      let assignedTechId = null;
      if (categoryId) {
        const category = await tx.supportCategory.findUnique({
          where: { id: categoryId },
        });
        if (category && category.defaultTechId)
          assignedTechId = category.defaultTechId;
      }

      const ticket = await tx.supportTicket.create({
        data: {
          title,
          description,
          creatorId,
          categoryId,
          caseType: caseType || "INCIDENTE",
          source: source || "PORTAL",
          assignedTechId,
          status: "ABIERTO",
          createdAt: createdAt ? new Date(createdAt) : undefined,

          // Usamos el arreglo de archivos que ya subimos a R2
          attachments: {
            create: attachmentsData,
          },
        },
        include: { creator: true, assignedTech: true },
      });

      // Auditoría
      await tx.supportAuditLog.create({
        data: {
          supportTicketId: ticket.id,
          userId: creatorId,
          action: "TICKET_CREATED",
          details: { status: "ABIERTO", autoAssignedTo: assignedTechId },
          timeElapsedSeconds: 0,
        },
      });

      // Notificación WhatsApp
      /*
      const targetPhone = ticket.assignedTech?.whatsappPhone || process.env.IT_SUPPORT_WHATSAPP_NUMBER;
      if (targetPhone) {
        await tx.reminder.create({
          data: {
            userId: creatorId,
            supportTicketId: ticket.id,
            scheduledAt: new Date(),
            messagePayload: `🚨 *NUEVO TICKET*\n👤 *Usuario:* ${ticket.creator.name}\n🎫 *Folio:* #${ticket.folio}\n📌 *Asunto:* ${ticket.title}\n\nEntra al sistema para revisarlo.`,
            status: 'PENDING'
          }
        });
      }
      */

      return ticket;
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    console.error("[Helpdesk] Error creando ticket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id: ticketId } = req.params;
    if (!ticketId) {
      return res
        .status(400)
        .json({ error: "Falta el ID del ticket en la URL" });
    }

    const { newStatus, techId } = req.body;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id: ticketId },
      include: { creator: true },
    });

    if (!ticket) return res.status(404).json({ error: "Ticket no encontrado" });

    // 1. Calcular el tiempo transcurrido desde el último cambio de estado
    const lastLog = await prisma.supportAuditLog.findFirst({
      where: { supportTicketId: ticketId },
      orderBy: { createdAt: "desc" },
    });

    const now = new Date();
    const timeElapsedSeconds = lastLog
      ? Math.floor((now.getTime() - lastLog.createdAt.getTime()) / 1000)
      : 0;

    // 2. Lógica de SLA (Tiempos de respuesta y resolución)
    let updateData = { status: newStatus, assignedTechId: techId };
    let whatsappMessage = "";

    // 3. Actualizar Ticket y crear Auditoría en Transacción
    const updatedTicket = await prisma.$transaction(async (tx) => {
      const updated = await tx.supportTicket.update({
        where: { id: ticketId },
        data: updateData,
      });

      await tx.supportAuditLog.create({
        data: {
          supportTicketId: ticketId,
          userId: techId,
          action: "STATUS_CHANGE",
          details: { from: ticket.status, to: newStatus },
          timeElapsedSeconds,
        },
      });

      return updated;
    });

    // 4. Encolar notificación de WhatsApp si aplica
    /*
    if (whatsappMessage) {
      await prisma.reminder.create({
        data: {
          userId: ticket.creatorId,
          supportTicketId: ticket.id,
          scheduledAt: now,
          messagePayload: whatsappMessage,
          status: 'PENDING'
        }
      });
    }
    */

    res.status(200).json({ success: true, data: updatedTicket });
  } catch (error) {
    console.error("[Helpdesk] Error actualizando ticket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { userId, role } = req.query;

    // Lógica de permisos:
    // Si es USER, solo ve los suyos. Si es TECH/ADMIN, ve todos.
    const whereClause = role === "USER" ? { creatorId: userId } : {};

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        assignedTech: {
          select: { id: true, name: true },
        },
        category: {
          select: { id: true, name: true },
        },
      },
      orderBy: {
        createdAt: "desc", // Los más recientes primero
      },
    });

    res.status(200).json({ success: true, data: tickets });
  } catch (error) {
    console.error("[Helpdesk] Error obteniendo tickets:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        creator: {
          select: { id: true, name: true, whatsappPhone: true },
        },
        assignedTech: {
          select: { id: true, name: true },
        },
        // Traemos los archivos adjuntos originales del ticket
        attachments: true,
        // Traemos el historial de chat ordenado cronológicamente
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: {
              select: { id: true, name: true, role: true },
            },
            attachments: true, // Archivos adjuntos en cada comentario
          },
        },
        // Opcional: Traemos la auditoría para ver los tiempos de SLA
        auditLogs: {
          orderBy: { createdAt: "asc" },
        },
        category: {
          select: { id: true, name: true },
        },
      },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("[Helpdesk] Error obteniendo detalle del ticket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
export const getSupportCategories = async (req, res) => {
  try {
    const categories = await prisma.supportCategory.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" }, // Ordenadas alfabéticamente
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAllCategoriesAdmin = async (req, res) => {
  try {
    const categories = await prisma.supportCategory.findMany({
      include: {
        defaultTech: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    // Agregamos parentId
    const { name, description, defaultTechId, parentId } = req.body;
    const category = await prisma.supportCategory.create({
      data: {
        name,
        description,
        defaultTechId: defaultTechId || null,
        parentId: parentId || null, // Guardamos el padre
      },
    });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, defaultTechId, isActive, parentId } = req.body;

    const category = await prisma.supportCategory.update({
      where: { id },
      data: {
        name,
        description,
        defaultTechId: defaultTechId || null,
        isActive,
        parentId: parentId || null, // Actualizamos el padre
      },
    });
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTechUsers = async (req, res) => {
  try {
    const techs = await prisma.user.findMany({
      where: { role: { in: ["ADMIN"] }, isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    });
    res.status(200).json({ success: true, data: techs });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getSupportMetrics = async (req, res) => {
  try {
    // Traemos todos los tickets para procesarlos en memoria (Rápido y compatible con cualquier BD)
    const tickets = await prisma.supportTicket.findMany({
      include: {
        category: {
          select: { name: true, parent: { select: { name: true } } },
        },
        creator: { select: { name: true } },
      },
    });

    // 1. KPIs (Columna Izquierda)
    const kpis = {
      total: tickets.length,
      assigned: tickets.filter((t) => t.assignedTechId !== null).length,
      closed: tickets.filter((t) => t.status === "CERRADO").length,
      pending: tickets.filter((t) =>
        ["ABIERTO", "ESPERANDO_USUARIO"].includes(t.status),
      ).length,
      problems: tickets.filter((t) => t.status === "EN_PROGRESO").length, // Simulando "Problemas"
    };

    // 2. Agrupación por Meses (Para Gráfico de Área y Barras Apiladas)
    const monthsMap = {};
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    }).reverse();

    last6Months.forEach((m) => {
      monthsMap[m] = { month: m, opened: 0, solved: 0, closed: 0, pending: 0 };
    });

    tickets.forEach((t) => {
      const month = `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}`;
      if (monthsMap[month]) {
        monthsMap[month].opened += 1;
        if (t.status === "RESUELTO") monthsMap[month].solved += 1;
        if (t.status === "CERRADO") monthsMap[month].closed += 1;
        if (["ABIERTO", "EN_PROGRESO", "ESPERANDO_USUARIO"].includes(t.status))
          monthsMap[month].pending += 1;
      }
    });
    const monthlyData = Object.values(monthsMap);

    // 3. Principales Categorías (Gráfico Horizontal)
    const catMap = {};
    tickets.forEach((t) => {
      let catName = t.category?.name || "Sin Categoría";
      if (t.category?.parent)
        catName = `${t.category.parent.name} > ${catName}`;
      catMap[catName] = (catMap[catName] || 0) + 1;
    });
    const topCategories = Object.keys(catMap)
      .map((name) => ({ name, count: catMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    // 4. Fuentes de Solicitud (Gráfico Vertical)
    const sourceMap = {};
    tickets.forEach((t) => {
      const source = t.source || "PORTAL";
      sourceMap[source] = (sourceMap[source] || 0) + 1;
    });
    const topSources = Object.keys(sourceMap).map((name) => ({
      name,
      count: sourceMap[name],
    }));

    // 5. Principales Solicitantes (Gráfico Horizontal)
    const reqMap = {};
    tickets.forEach((t) => {
      const reqName = t.creator?.name || "Desconocido";
      reqMap[reqName] = (reqMap[reqName] || 0) + 1;
    });
    const topRequesters = Object.keys(reqMap)
      .map((name) => ({ name, count: reqMap[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5

    res.status(200).json({
      success: true,
      data: { kpis, monthlyData, topCategories, topSources, topRequesters },
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
