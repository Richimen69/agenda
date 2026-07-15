import prisma from "./prisma.js";

export const createArea = async (req, res) => {
  try {
    const { name, parentId } = req.body;

    const area = await prisma.area.create({
      data: { name, parentId: parentId || null },
    });

    res.status(201).json({ success: true, data: area });
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        error: "El área ya existe o los datos son inválidos",
      });
  }
};

// Listar el árbol completo (departamentos con sus puestos anidados)
export const getAreasTree = async (req, res) => {
  try {
    const areas = await prisma.area.findMany({
      where: { parentId: null }, // solo raíces
      include: { children: true },
    });
     res.status(200).json({ success: true, data: areas });
  } catch (error) {
    res.status(500).json({ error: error.message });
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
