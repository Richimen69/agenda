import prisma from '#config/prisma';

export const createAction = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { 
      title, 
      weight, 
      startDate, 
      endDate, 
      ownerId, 
      parentId 
    } = req.body;

    // Usamos el modelo projectAction en inglés
    const newAction = await prisma.projectAction.create({
      data: {
        title,
        weight: weight || 1.0,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        projectId,
        ownerId, // El usuario responsable de ejecutarla
        parentId: parentId || null // Si es null, es Tarea Raíz. Si tiene UUID, es Sub-tarea.
      }
    });

    return res.status(201).json({ 
      success: true, 
      data: newAction 
    });

  } catch (error) {
    console.error("Error in createAction:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Error creating the project action." 
    });
  }
};

// ==========================================
// GET ACTION TREE (Work Breakdown Structure)
// ==========================================
export const getActionTree = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const actionsTree = await prisma.projectAction.findMany({
      where: { 
        projectId,
        parentId: null // Traer SOLO el Nivel 1 (Las raíces) para no duplicar datos
      },
      // Ordenamos por fecha de inicio para que el Gantt/Lista tenga sentido temporal
      orderBy: { startDate: 'asc' }, 
      include: {
        owner: { select: { id: true, name: true, email: true } },
        kpis: true, // Asumiendo que tu tabla de KPIs se llama 'Kpi'
        children: {
          orderBy: { startDate: 'asc' },
          include: {
            owner: { select: { id: true, name: true, email: true } },
            kpis: true,
            children: {
               // Nivel 3 de anidación (Puedes seguir bajando si el negocio lo requiere)
               include: {
                 owner: { select: { id: true, name: true } },
                 kpis: true
               }
            } 
          }
        }
      }
    });

    return res.status(200).json({ 
      success: true, 
      data: actionsTree 
    });

  } catch (error) {
    console.error("Error in getActionTree:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Error retrieving the project action tree." 
    });
  }
};