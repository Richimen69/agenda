import prisma from "./prisma.js";

export const crearAccion = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;
    const { titulo, peso, fechaInicio, fechaFin, ownerId, parentId } = req.body;

    const nuevaAccion = await prisma.accion.create({
      data: {
        titulo,
        peso: peso || 1.0,
        fechaInicio: new Date(fechaInicio),
        fechaFin: new Date(fechaFin),
        proyectoId,
        ownerId,
        parentId: parentId || null // null la pone como raíz
      }
    });

    return res.status(201).json(nuevaAccion);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al crear la acción" });
  }
};

export const obtenerArbolDeAcciones = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;

    const acciones = await prisma.accion.findMany({
      where: { 
        proyectoId,
        parentId: null // Traer solo Nivel 1 (Prisma trae los hijos por el include)
      },
      include: {
        owner: { select: { name: true } },
        kpis: true,
        children: {
          include: {
            owner: { select: { name: true } },
            kpis: true,
            children: true // Nivel 3
          }
        }
      }
    });

    return res.json(acciones);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error al obtener el árbol" });
  }
};