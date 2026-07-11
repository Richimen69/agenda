import prisma from "./prisma.js";

export const crearProyecto = async (req, res) => {
  try {
    const { titulo, descripcion, fechaObjetivo, creatorId } = req.body;
    // Ojo: idealmente creatorId viene de req.user (si usas middleware de JWT), 
    // pero si lo pasas por body por ahora, está bien.

    const nuevoProyecto = await prisma.proyecto.create({
      data: {
        titulo,
        descripcion,
        fechaObjetivo: new Date(fechaObjetivo),
        creatorId
      }
    });

    return res.status(201).json(nuevoProyecto);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear el proyecto" });
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
            area: { select: { nombre: true } }
          }
        }
      },
      orderBy: { fechaObjetivo: 'asc' }
    });

    return res.json(proyectos);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener dashboard" });
  }
};

export const obtenerProyectoPorId = async (req, res) => {
  // Lógica para traer un proyecto individual
};