import prisma from "./prisma.js";

export const createArea = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const area = await prisma.area.create({
      data: { name, parentId: parentId || null },
    });

    res.status(201).json({ success: true, data: area });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: "El área ya existe o los datos son inválidos",
    });
  }
};

// Listar el árbol completo (departamentos con sus puestos anidados)
export const getAreasTree = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      where: { parentId: null }, // Solo traemos los Departamentos Raíz (ej. "Sistemas")
      include: {
        children: {
          // 1er Nivel: Los Puestos (ej. "Auxiliar de Sistemas")
          include: {
            users: {
              // 2do Nivel: Las Personas reales en ese puesto
              select: {
                // Usamos 'select' para no mandar passwords ni datos sensibles
                id: true,
                name: true,
                email: true, // (Opcional, útil para la UI)
              },
              where: {
                isActive: true, // Buena práctica: no traer exempleados
              },
            },
          },
        },
        users: {
          select: { id: true, name: true },
        },
      },
    });

    res.status(200).json({ success: true, data: areas });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Error al obtener el árbol de áreas y usuarios" });
  }
};

export const deleteArea = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.area.delete({ where: { id } });
    res.json({ success: true });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, error: "Error al eliminar el área" });
  }
};
