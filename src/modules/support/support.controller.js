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
    if (targetPhone) {
      await prisma.reminder.create({
        data: {
          userId: authorId,
          supportTicketId: ticketId,
          scheduledAt: new Date(),
          messagePayload: message,
          status: "PENDING",
        },
      });
    }

    res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("[Helpdesk] Error agregando comentario:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createSupportTicket = async (req, res) => {
  try {
    // Recibimos los datos y los archivos (previamente subidos con Multer)
    const { title, description, creatorId } = req.body;
    const files = req.files; // Array de archivos adjuntos

    const newTicket = await prisma.$transaction(async (tx) => {
      const ticket = await tx.supportTicket.create({
        data: {
          title,
          description,
          creatorId,
          status: "ABIERTO",
          attachments: {
            create:
              files?.map((f) => ({
                fileUrl: f.path,
                fileName: f.originalname,
                fileType: f.mimetype,
              })) || [],
          },
        },
        include: { creator: true },
      });

      const itPhoneNumber = process.env.IT_SUPPORT_WHATSAPP_NUMBER;

      await tx.reminder.create({
        data: {
          userId: creatorId, // Solo por referencia
          supportTicketId: ticket.id,
          scheduledAt: new Date(),
          messagePayload: `🚨 *NUEVO TICKET DE SOPORTE*\n👤 *Usuario:* ${ticket.creator.name}\n🎫 *Folio:* #${ticket.folio}\n📌 *Asunto:* ${ticket.title}\n\nEntra al sistema para revisarlo.`,
          status: "PENDING",
        },
      });

      return ticket;
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
// ==========================================
// 2. ACTUALIZAR ESTADO Y CALCULAR SLA
// ==========================================
export const updateTicketStatus = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { newStatus, techId } = req.body; // techId es el ID del técnico haciendo el cambio

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

    if (newStatus === "EN_PROGRESO" && !ticket.firstResponseAt) {
      updateData.firstResponseAt = now; // Se marca el SLA de primera respuesta
      whatsappMessage = `*Soporte TI - Folio #${ticket.folio}*\nTu ticket está siendo atendido por uno de nuestros técnicos. 👨‍💻`;
    } else if (newStatus === "RESUELTO") {
      updateData.resolvedAt = now; // Inicia el reloj de 48h para cierre
      whatsappMessage = `*Soporte TI - Folio #${ticket.folio}*\nTu ticket ha sido marcado como *RESUELTO* ✅.\n\nSi el problema persiste, por favor responde a este mensaje. Si no hay respuesta, el ticket se cerrará automáticamente en 48 horas.`;
    }

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
    if (whatsappMessage) {
      await prisma.reminder.create({
        data: {
          userId: ticket.creatorId,
          supportTicketId: ticket.id,
          scheduledAt: now,
          messagePayload: whatsappMessage,
          status: "PENDING",
        },
      });
    }

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
    const whereClause = role === 'USER' ? { creatorId: userId } : {};

    const tickets = await prisma.supportTicket.findMany({
      where: whereClause,
      include: {
        creator: {
          select: { id: true, name: true, email: true } // No enviamos el password al front
        },
        assignedTech: {
          select: { id: true, name: true }
        }
      },
      orderBy: {
        createdAt: 'desc' // Los más recientes primero
      }
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
          select: { id: true, name: true, whatsappPhone: true }
        },
        assignedTech: {
          select: { id: true, name: true }
        },
        // Traemos los archivos adjuntos originales del ticket
        attachments: true, 
        // Traemos el historial de chat ordenado cronológicamente
        comments: {
          orderBy: { createdAt: 'asc' },
          include: {
            author: {
              select: { id: true, name: true, role: true }
            },
            attachments: true // Archivos adjuntos en cada comentario
          }
        },
        // Opcional: Traemos la auditoría para ver los tiempos de SLA
        auditLogs: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!ticket) {
      return res.status(404).json({ success: false, error: "Ticket no encontrado" });
    }

    res.status(200).json({ success: true, data: ticket });
  } catch (error) {
    console.error("[Helpdesk] Error obteniendo detalle del ticket:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

