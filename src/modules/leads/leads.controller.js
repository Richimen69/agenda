import prisma from "#config/prisma";
import { sanitizeLeadInput } from "./utils/leadSanitizer.js";

export const createLead = async (req, res) => {
  try {
    const data = sanitizeLeadInput(req.body);

    if (!data.fullName || !data.source) {
      return res
        .status(400)
        .json({ success: false, error: "fullName y source son obligatorios" });
    }

    const newLead = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.create({ data });
      await tx.leadComment.create({
        data: {
          leadId: lead.id,
          text: `Lead creado (origen: ${lead.source})`,
          author: "Sistema",
          type: "SYSTEM_CREATED",
        },
      });
      return lead;
    });

    const leadWithComments = await prisma.lead.findUnique({
      where: { id: newLead.id },
      include: { comments: true },
    });

    res.status(201).json({ success: true, data: leadWithComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateLead = async (req, res) => {
  try {
    const { id } = req.params;
    const leadId = Number(id);
    const data = sanitizeLeadInput(req.body);

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });
    if (!existingLead) {
      return res
        .status(404)
        .json({ success: false, error: "Lead no encontrado" });
    }

    const updatedLead = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({ where: { id: leadId }, data });

      if (data.status && data.status !== existingLead.status) {
        await tx.leadComment.create({
          data: {
            leadId,
            text: `Estado cambiado de ${existingLead.status} a ${data.status}`,
            author: "Sistema",
            type: "SYSTEM_STATUS_CHANGE",
          },
        });
      }

      return lead;
    });

    const leadWithComments = await prisma.lead.findUnique({
      where: { id: leadId },
      include: { comments: true },
    });

    res.json({ success: true, data: leadWithComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar el lead" });
  }
};
// 1. Obtener todos los leads (Para la tabla principal del equipo de leads)
export const getLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      // Excluimos los que están en recuperación profunda si quieres limpiar la vista principal
      // o simplemente traemos todos, ordenados por fecha de creación descendente
      orderBy: { createdAt: "desc" },
      include: {
        comments: true, // Traemos el historial de notas asociado a cada lead
      },
    });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener los leads" });
  }
};

// 2. Obtener SOLO los leads para recuperación
export const getRecoveryLeads = async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      where: {
        needsRecovery: true, // Magia: Solo trae los marcados para rescate
      },
      include: {
        comments: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    res.json(leads);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener leads de recuperación" });
  }
};

export const deleteLead = async (req, res) => {
  try {
    const { id } = req.params;

    const leadId = Number(id);

    const existingLead = await prisma.lead.findUnique({
      where: { id: leadId },
    });

    if (!existingLead) {
      return res
        .status(404)
        .json({ success: false, error: "Lead no encontrado" });
    }

    await prisma.lead.delete({ where: { id: leadId } });

    res.json({ success: true, message: "Lead eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 5. Agregar un comentario al historial de un Lead
export const addComment = async (req, res) => {
  const { leadId } = req.params;
  const { text, author } = req.body;

  try {
    const newComment = await prisma.leadComment.create({
      data: {
        text,
        author,
        leadId: Number(leadId),
      },
    });
    res.status(201).json(newComment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al agregar comentario" });
  }
};

const DUPLICATE_WINDOW_DAYS = 30;

export const checkDuplicatePhones = async (req, res) => {
  const { phones } = req.body;

  if (!Array.isArray(phones) || phones.length === 0) {
    return res
      .status(400)
      .json({ success: false, error: "Se requiere un array de teléfonos" });
  }

  // Normaliza igual que el frontend, por si llegan con espacios/guiones
  const cleanPhones = phones
    .map((p) => String(p).replace(/\D/g, ""))
    .filter(Boolean);

  try {
    const matches = await prisma.lead.findMany({
      where: { phone: { in: cleanPhones } },
      orderBy: { date: "desc" },
      distinct: ["phone"],
      select: {
        id: true,
        phone: true,
        date: true,
        status: true,
        department: true,
        fullName: true,
      },
    });

    const matchMap = {};
    matches.forEach((lead) => {
      const daysSince = Math.floor(
        (Date.now() - new Date(lead.date).getTime()) / 86400000,
      );
      matchMap[lead.phone] = {
        ...lead,
        daysSince,
        isRecent: daysSince <= DUPLICATE_WINDOW_DAYS,
      };
    });

    res.json({ success: true, data: matchMap });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ success: false, error: "Error al verificar duplicados" });
  }
};

export const reactivateLead = async (req, res) => {
  const { id } = req.params;
  const { newInterest, newSource, note, author = "Sistema" } = req.body;

  try {
    const updatedLead = await prisma.$transaction(async (tx) => {
      const lead = await tx.lead.update({
        where: { id: Number(id) },
        data: {
          isReturning: true,
          status: "NUEVO",
          ...(newInterest && { interest: newInterest }),
          ...(newSource && { lastContactSource: newSource }),
        },
      });

      await tx.leadComment.create({
        data: {
          leadId: Number(id),
          text: note,
          author,
          type: "SYSTEM_REACTIVATED",
        },
      });

      return lead;
    });

    const leadWithComments = await prisma.lead.findUnique({
      where: { id: Number(id) },
      include: { comments: true },
    });

    res.json({ success: true, data: leadWithComments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al reactivar el lead" });
  }
};

// Panel: Resultados por Campaña (solo leads generados, sin CPL por ahora)
export const getCampaignResults = async (req, res) => {
  const { month } = req.query; // ej. "2026-07"

  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const leadsByCampaign = await prisma.lead.groupBy({
      by: ["source"],
      where: { date: { gte: startDate, lt: endDate } },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    });

    const data = leadsByCampaign.map((c) => ({
      campaign: c.source,
      leads: c._count.id,
    }));

    const totalLeads = data.reduce((sum, c) => sum + c.leads, 0);

    res.json({ success: true, data, totalLeads });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al obtener resultados por campaña" });
  }
};

export const getRecoveryFunnel = async (req, res) => {
  const { month } = req.query;

  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const [conversaciones, enSeguimiento, noContactables, recuperados, traidosDeVuelta, totalLeads] =
      await Promise.all([
        prisma.leadComment.count({ where: { createdAt: { gte: startDate, lt: endDate } } }),
        prisma.lead.count({ where: { recoveryStatus: "EN_SEGUIMIENTO", updatedAt: { gte: startDate, lt: endDate } } }),
        prisma.lead.count({ where: { recoveryStatus: "NO_CONTACTABLE", updatedAt: { gte: startDate, lt: endDate } } }),
        prisma.lead.count({ where: { recoveryStatus: "RECUPERADO_Y_ASIGNADO", updatedAt: { gte: startDate, lt: endDate } } }),
        prisma.leadComment.count({ where: { type: "SYSTEM_REACTIVATED", createdAt: { gte: startDate, lt: endDate } } }),
        prisma.lead.count({ where: { date: { gte: startDate, lt: endDate } } }),
      ]);

    res.json({
      success: true,
      data: {
        conversaciones,
        enSeguimiento,
        noContactables,
        recuperados,
        traidosDeVuelta,
        conversionRate: conversaciones > 0 ? +((enSeguimiento / conversaciones) * 100).toFixed(1) : 0,
        recuperacionRate:
          enSeguimiento + noContactables > 0
            ? +((recuperados / (enSeguimiento + noContactables)) * 100).toFixed(1)
            : 0,
        efectividadRate: totalLeads > 0 ? +((traidosDeVuelta / totalLeads) * 100).toFixed(1) : 0,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al obtener funnel de recuperación" });
  }
};

export const getDigitalFunnel = async (req, res) => {
  const { month, department } = req.query;

  if (!department) {
    return res.status(400).json({ success: false, error: "Se requiere el parámetro department" });
  }

  try {
    const startDate = new Date(`${month}-01T00:00:00.000Z`);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + 1);

    const departmentList = department.split(","); 

    const baseWhere = {
      department: { in: departmentList }, 
      date: { gte: startDate, lt: endDate },
    };

    // Agregamos la consulta de ventas (quinto elemento del arreglo)
    const [leads, contactados, citas, shows, ventas] = await Promise.all([
      prisma.lead.count({ where: baseWhere }),
      prisma.lead.count({ where: { ...baseWhere, status: { not: "NUEVO" } } }),
      prisma.lead.count({ where: { ...baseWhere, hasAppointment: true } }),
      prisma.lead.count({ where: { ...baseWhere, showedUp: true } }),
      // Contamos como venta si tiene un monto mayor a 0
      prisma.lead.count({ where: { ...baseWhere, amount: { gt: 0 } } }), 
    ]);

    const calcPercent = (value) => (leads > 0 ? +((value / leads) * 100).toFixed(0) : 0);

    res.json({
      success: true,
      data: {
        department: departmentList,
        leads,
        contactados,
        citas,
        shows,
        ventas, // Ya se calcula dinámicamente
        contactadosPercent: calcPercent(contactados),
        citasPercent: calcPercent(citas),
        showsPercent: calcPercent(shows),
        ventasPercent: calcPercent(ventas),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, error: "Error al obtener funnel digital" });
  }
};