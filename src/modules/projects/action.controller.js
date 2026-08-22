import prisma from "#config/prisma";

export const createAction = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    // 👉 NUEVO: Agregamos 'teamIds' para recibir al equipo completo
    const {
      title,
      weight,
      startDate,
      endDate,
      ownerId,
      parentId,
      creatorId,
      teamIds,
    } = req.body;

    const currentUserId = creatorId || ownerId;

    const newAction = await prisma.projectAction.create({
      data: {
        title,
        weight: weight || 1.0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
        ownerId: ownerId || null,
        parentId: parentId || null,
      },
    });

    // ESCENARIO A: Tarea Raíz -> Creamos el TICKET y le asignamos a todo el equipo
    if (!parentId) {
      let assigneesToConnect = [];
      if (teamIds && teamIds.length > 0) {
        assigneesToConnect = teamIds.map((id) => ({ id }));
      } else if (ownerId) {
        assigneesToConnect = [{ id: ownerId }]; // El caso de 1 solo usuario
      }
      await prisma.ticket.create({
        data: {
          title: title,
          description: `Generado automáticamente desde el Proyecto Estratégico.`,
          priority: "ALTA",
          status: "NUEVO",
          dueDate: new Date(endDate),
          creatorId: currentUserId,
          projectActionId: newAction.id,
          assignees:
            assigneesToConnect.length > 0
              ? { connect: assigneesToConnect }
              : undefined,
        },
      });
    }
    // ESCENARIO B: Subtarea (Se mantiene igual)
    else {
      const parentAction = await prisma.projectAction.findUnique({
        where: { id: parentId },
        include: { ticket: true },
      });

      if (parentAction && parentAction.ticket) {
        await prisma.subtask.create({
          data: {
            title: title,
            isDone: false,
            assigneeId: ownerId,
            ticketId: parentAction.ticket.id,
            projectActionId: newAction.id,
          },
        });

        if (ownerId) {
          await prisma.ticket.update({
            where: { id: parentAction.ticket.id },
            data: { assignees: { connect: { id: ownerId } } },
          });
        }
      }
    }

    return res.status(201).json({ success: true, data: newAction });
  } catch (error) {
    console.error("Error in createAction:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error al crear la tarea." });
  }
};
export const getActionTree = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const actionsTree = await prisma.projectAction.findMany({
      where: {
        projectId,
        parentId: null,
      },
      orderBy: { startDate: "asc" },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        kpis: true,
        ticket: { select: { id: true } },
        children: {
          orderBy: { startDate: "asc" },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            kpis: true,
            subtask: { select: { id: true, ticketId: true } },
            children: {
              include: {
                owner: { select: { id: true, name: true } },
                kpis: true,
                subtask: { select: { id: true, ticketId: true } },
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: actionsTree,
    });
  } catch (error) {
    console.error("Error in getActionTree:", error);
    return res.status(500).json({
      success: false,
      error: "Error retrieving the project action tree.",
    });
  }
};
