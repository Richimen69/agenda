import prisma from "#config/prisma";

export const addProject = async (req, res) => {
  try {
    const { title, description, targetDate, creatorId, members } = req.body;
    const currentUserId = creatorId;
    const newProject = await prisma.project.create({
      data: {
        title,
        description,
        targetDate: new Date(targetDate),
        creatorId: currentUserId,

        members: {
          create:
            members && members.length > 0
              ? members.map((m) => ({
                  userId: m.userId,
                  areaId: m.areaId,
                  roleType: m.roleType,
                  businessRole: m.businessRole,
                }))
              : [],
        },
      },

      include: {
        members: {
          include: {
            user: { select: { name: true, email: true } },
            area: { select: { name: true } },
          },
        },
      },
    });

    // 4. Respuesta exitosa
    return res.status(201).json({
      success: true,
      data: newProject,
    });
  } catch (error) {
    console.error("Error en addProject:", error);
    return res.status(500).json({
      success: false,
      error: "Ocurrió un error al crear el proyecto estratégico.",
    });
  }
};

export const obtenerDashboard = async (req, res) => {
  try {
    const proyectos = await prisma.proyecto.findMany({
      select: {
        id: true,
        titulo: true,
        estado: true,
        fechaObjetivo: true,
        avanceGlobal: true,
        salud: true,
        participantes: {
          include: {
            user: { select: { name: true } },
            area: { select: { nombre: true } },
          },
        },
      },
      orderBy: { fechaObjetivo: "asc" },
    });

    return res.json(proyectos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener dashboard" });
  }
};

// ==========================================
// OBTENER TODOS LOS PROYECTOS (Para el Dashboard)
// ==========================================
export const getProjects = async (req, res) => {
  try {
    const { userId } = req.query; // Capturamos si el frontend nos manda un ID

    // Armamos el filtro dinámico
    const whereCondition = userId
      ? {
          // Prisma: Tráeme proyectos donde sea el creador O sea un participante
          OR: [
            { creatorId: userId },
            { members: { some: { userId: userId } } },
          ],
        }
      : {}; // Si no mandan userId, el where queda vacío (trae todos)

    const projects = await prisma.project.findMany({
      where: whereCondition,
      orderBy: { targetDate: "asc" },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            area: { select: { id: true, name: true } },
          },
        },
        actions: {
          where: {
            kpis: { some: {} },
          },
          include: { kpis: true },
        },
        ratios: true,
      },
    });

    return res.status(200).json({ success: true, data: projects });
  } catch (error) {
    console.error("Error en getProjects:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener los proyectos.",
    });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            area: { select: { id: true, name: true } },
          },
        },
        // Aquí en el futuro incluiremos el árbol de acciones (ProjectAction)
        actions: {
          where: { parentId: null }, // Solo traer nivel raíz
          include: { children: true },
        },
        ratios: true,
        projectComments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!project) {
      return res
        .status(404)
        .json({ success: false, error: "Proyecto no encontrado." });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error("Error en getProjectById:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error al obtener el proyecto." });
  }
};
export const createProjectRatio = async (req, res) => {
  try {
    const { id: projectId } = req.params;

    const { name, unit, numeratorNames, denominatorNames } = req.body;
    if (
      !numeratorNames ||
      !denominatorNames ||
      numeratorNames.length === 0 ||
      denominatorNames.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Debes enviar al menos un KPI para el numerador y uno para el denominador.",
      });
    }

    const newRatio = await prisma.projectRatio.create({
      data: {
        name,
        unit,
        numeratorNames,
        denominatorNames,
        projectId,
      },
    });

    return res.status(201).json({ success: true, data: newRatio });
  } catch (error) {
    console.error("Error en createProjectRatio:", error);
    return res.status(500).json({
      success: false,
      error: "Error al crear el ratio de eficiencia.",
    });
  }
};

export const addProjectComment = async (req, res) => {
  try {
    const { id: projectId } = req.params;
    const { text, userId } = req.body;

    const newComment = await prisma.projectComment.create({
      data: {
        text,
        projectId,
        userId,
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return res.status(201).json({ success: true, data: newComment });
  } catch (error) {
    console.error("Error en addProjectComment:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error al guardar el comentario." });
  }
};
export const getGlobalDashboard = async (req, res) => {
  try {
    // 1. Distribución de Salud de los Proyectos (¿Cuántos verdes, amarillos, rojos?)
    const healthStats = await prisma.project.groupBy({
      by: ["health"],
      _count: { health: true },
    });

    const healthDistribution = { GREEN: 0, YELLOW: 0, RED: 0 };
    healthStats.forEach((stat) => {
      healthDistribution[stat.health] = stat._count.health;
    });

    // 2. Presupuesto Global de la Empresa
    // Buscamos todos los KPIs financieros de todos los proyectos activos
    const financialKpis = await prisma.kpi.aggregate({
      where: {
        type: "FINANCIAL",
        action: { project: { status: { not: "COMPLETED" } } },
      },
      _sum: { target: true, currentValue: true },
    });

    // 3. Proyectos en Riesgo Crítico (Para la lista de atención inmediata)
    const criticalProjects = await prisma.project.findMany({
      where: { health: "RED", status: { not: "COMPLETED" } },
      select: {
        id: true,
        title: true,
        globalProgress: true,
        targetDate: true,
        members: {
          where: { roleType: "OWNER" },
          select: { user: { select: { name: true } } },
        },
      },
      take: 5, // Solo mostramos el Top 5 más crítico
    });

    // 4. Promedio de Avance de la Empresa
    const progressStat = await prisma.project.aggregate({
      where: { status: { not: "COMPLETED" } },
      _avg: { globalProgress: true },
      _count: { id: true },
    });

    return res.status(200).json({
      success: true,
      data: {
        globalMetrics: {
          totalProjects: progressStat._count.id,
          overallCompanyProgress: progressStat._avg.globalProgress
            ? parseFloat(progressStat._avg.globalProgress.toFixed(2))
            : 0,
          totalBudget: financialKpis._sum.target || 0,
          consumedBudget: financialKpis._sum.currentValue || 0,
        },
        healthDistribution,
        criticalAttention: criticalProjects,
      },
    });
  } catch (error) {
    console.error("Error en getGlobalDashboard:", error);
    return res
      .status(500)
      .json({ success: false, error: "Error calculando métricas globales." });
  }
};
