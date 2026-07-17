import prisma from "./prisma.js";

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

// ==========================================
// OBTENER DETALLE DE UN PROYECTO
// ==========================================
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
