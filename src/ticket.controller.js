import prisma from "./prisma.js";

export const createTicket = async (req, res) => {
  try {
    const {
      title,
      description,
      creatorId,
      assigneeIds,
      dueDate,
      priority,
      subtasks,
    } = req.body;

    const newTicket = await prisma.ticket.create({
      data: {
        title,
        description,
        priority: priority ?? "MEDIA",
        creatorId,
        dueDate: dueDate ? new Date(dueDate) : null,
        assignees: { connect: assigneeIds.map((id) => ({ id })) },
        // Actualizado para recibir el assigneeId en cada subtarea
        subtasks:
          subtasks && subtasks.length > 0
            ? {
                create: subtasks.map((task) => ({
                  title: task.title,
                  assigneeId: task.assigneeId || null,
                })),
              }
            : undefined,
        auditLogs: {
          create: {
            userId: creatorId,
            action: "TICKET_CREATED",
            details: { message: "Proyecto creado" },
          },
        },
      },
      include: { creator: true, assignees: true, subtasks: true },
    });

    res.status(201).json({ success: true, data: newTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addSubtask = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, assigneeId } = req.body; // Ahora recibimos a quién le toca

    const subtask = await prisma.subtask.create({
      data: { title, ticketId: id, assigneeId: assigneeId || null },
      include: { assignee: { select: { name: true } } },
    });
    res.json({ success: true, data: subtask });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const toggleSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { isDone, userId } = req.body; // Recibimos quién intenta marcarla

    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { ticket: true },
    });

    if (!subtask)
      return res
        .status(404)
        .json({ success: false, error: "Subtarea no encontrada" });

    // REGLA DE SEGURIDAD: Si la subtarea tiene un asignado, solo él o el creador del proyecto pueden marcarla
    if (
      subtask.assigneeId &&
      subtask.assigneeId !== userId &&
      subtask.ticket.creatorId !== userId
    ) {
      return res.status(403).json({
        success: false,
        error: "Solo el responsable de esta subtarea puede completarla.",
      });
    }

    const updated = await prisma.subtask.update({
      where: { id: subtaskId },
      data: { isDone },
    });
    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const deleteSubtask = async (req, res) => {
  try {
    const { subtaskId } = req.params;
    const { userId } = req.body; // Quien intenta borrar

    // Buscamos la subtarea y su proyecto padre
    const subtask = await prisma.subtask.findUnique({
      where: { id: subtaskId },
      include: { ticket: true },
    });

    if (!subtask)
      return res
        .status(404)
        .json({ success: false, error: "Subtarea no encontrada" });

    // Validacion de seguridad
    if (subtask.ticket.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Solo el creador del proyecto puede borrar subtareas.",
      });
    }

    await prisma.subtask.delete({ where: { id: subtaskId } });
    res.json({ success: true, message: "Subtarea eliminada" });
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

export const updateTicketPriority = async (req, res) => {
  try {
    const { id } = req.params;
    const { priority, userId } = req.body;

    const oldTicket = await prisma.ticket.findUnique({ where: { id } });

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        priority,
        auditLogs: {
          create: {
            userId,
            action: "PRIORITY_CHANGED",
            details: {
              old_priority: oldTicket.priority,
              new_priority: priority,
            },
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
    const { userId } = req.query;

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

        // ---> ESTA ES LA LÍNEA MÁGICA QUE FALTA <---
        subtasks: { orderBy: { createdAt: "asc" } },

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

export const getTicketById = async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await prisma.ticket.findUnique({
      where: { id },
      include: {
        creator: { select: { name: true } },
        assignees: { select: { id: true, name: true } },
        subtasks: { orderBy: { createdAt: "asc" } },
        comments: {
          include: { user: { select: { name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Ticket no encontrado" });
    }

    res.json({ success: true, data: ticket });
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
export const deleteTicket = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body; // Recibimos quién intenta borrarlo

    // 1. Buscamos el proyecto
    const ticket = await prisma.ticket.findUnique({ where: { id } });

    if (!ticket) {
      return res
        .status(404)
        .json({ success: false, error: "Proyecto no encontrado" });
    }

    // 2. REGLA DE NEGOCIO: Solo el creador puede borrarlo
    if (ticket.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error:
          "No tienes permiso para borrar este proyecto. Solo el creador puede hacerlo.",
      });
    }

    // 3. Si pasa la validación, lo borramos
    await prisma.ticket.delete({ where: { id } });
    res.json({ success: true, message: "Proyecto eliminado correctamente" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
export const updateTicketAssignees = async (req, res) => {
  try {
    const { id } = req.params;
    const { assigneeIds, userId } = req.body;

    const ticket = await prisma.ticket.findUnique({ where: { id } });

    // REGLA: Solo el creador puede meter o sacar gente del proyecto
    if (ticket.creatorId !== userId) {
      return res.status(403).json({
        success: false,
        error: "Solo el creador del proyecto puede modificar el equipo.",
      });
    }

    const updatedTicket = await prisma.ticket.update({
      where: { id },
      data: {
        assignees: {
          set: assigneeIds.map((id) => ({ id })), // 'set' reemplaza la lista actual con la nueva
        },
      },
      include: { assignees: true },
    });

    res.json({ success: true, data: updatedTicket });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
