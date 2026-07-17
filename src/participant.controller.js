import prisma from "./prisma.js";

export const asignarParticipante = async (req, res) => {
  try {
    const { id: proyectoId } = req.params;
    const { userId, areaId, tipoRol } = req.body; // 'OWNER' | 'SOPORTE' | 'OBSERVER'

    const participacion = await prisma.proyectoParticipante.create({
      data: {
        proyectoId,
        userId,
        areaId,
        tipoRol
      },
      include: {
        user: { select: { name: true } },
        area: true
      }
    });

    return res.status(201).json(participacion);
  } catch (error) {
    console.error(error);
    // Prisma tira P2002 si violas la regla @@unique (usuario duplicado en el proyecto)
    if (error.code === 'P2002') {
      return res.status(400).json({ error: "El usuario ya tiene un rol en este proyecto." });
    }
    return res.status(500).json({ error: "Error al asignar participante" });
  }
};