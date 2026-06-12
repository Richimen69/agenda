import prisma from "./prisma.js";

export const createTicket = async (req, res) => {
  try {
    const { title, description, creatorId, assigneeIds, dueDate } = req.body;

    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : null,
        // Conectamos multiples usuarios asignados
        assignees: {
          connect: assigneeIds.map((id) => ({ id })),
        },
        auditLogs: {
          create: {
            userId: creatorId,
            action: "TICKET_CREATED",
            details: { message: "Proyecto creado" },
          },
        },
      },
      include: { creator: true, assignees: true },
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateTicketStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, userId } = req.body;

    const oldTicket = await prisma.ticket.findUnique({ where: { id } });

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status,
        auditLogs: {
          create: {
            userId: userId,
            action: "STATUS_CHANGED",
            details: { old_status: oldTicket.status, new_status: status },
          },
        },
      },
    });

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTickets = async (req, res) => {
  try {
    const { userId } = req.query; // Recibimos el ID del usuario logueado

    // Filtro: Traer tickets donde el usuario sea el creador O este en la lista de asignados
    const whereClause = userId
      ? {
          OR: [{ creatorId: userId }, { assignees: { some: { id: userId } } }],
        }
      : {};

    const tickets = await prisma.ticket.findMany({
      where: whereClause,
      include: {
        creator: { select: { name: true } },
        assignees: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: tickets });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// NUEVA FUNCION: Agregar comentario y cambiar estado automaticamente
export const addComment = async (req, res) => {
  try {
    const { id } = req.params; // ID del ticket
    const { userId, text } = req.body;

    // 1. Obtenemos el ticket actual para ver sus asignados y estado
    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: { assignees: true },
    });

    if (!ticket)
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado" });

    // 2. Verificamos si el usuario que comenta es uno de los asignados
    const isAssignee = ticket.assignees.some((user) => user.id === userId);

    // 3. Logica de negocio: Si es asignado y el estado es NUEVO, pasa a EN_PROGRESO
    let newStatus = ticket.status;
    let statusChanged = false;

    if (isAssignee && ticket.status === "NUEVO") {
      newStatus = "EN_PROGRESO";
      statusChanged = true;
    }

    // 4. Guardamos el comentario, actualizamos el estado y creamos la bitacora en una sola transaccion
    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        status: newStatus,
        comments: {
          create: { text, userId },
        },
        auditLogs: {
          create: {
            userId,
            action: statusChanged
              ? "COMMENT_AND_STATUS_CHANGED"
              : "COMMENT_ADDED",
            details: {
              comment: text,
              status_changed: statusChanged,
              old_status: ticket.status,
              new_status: newStatus,
            },
          },
        },
      },
      include: {
        comments: { include: { user: true } },
        assignees: true,
      },
    });

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
