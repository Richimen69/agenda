import { PrismaClient } from "@prisma/client";
import {
  generatePresignedUrl,
  deleteFileFromR2,
} from "../../services/r2.service.js";

const prisma = new PrismaClient();

// ==========================================
// 1. GENERAR URL PREFIRMADA (Para subir a R2)
// ==========================================
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res
        .status(400)
        .json({ error: "fileName y fileType son requeridos" });
    }

    const data = await generatePresignedUrl(fileName, fileType);
    res.status(200).json(data);
  } catch (error) {
    console.error("[Knowledge] Error en getUploadUrl:", error);
    res.status(500).json({ error: "Error al generar la URL de subida" });
  }
};

// ==========================================
// 2. GUARDAR METADATA DEL DOCUMENTO EN BD
// ==========================================
export const createDocument = async (req, res) => {
  try {
    const {
      title,
      description,
      fileUrl,
      fileKey,
      fileType,
      fileSize,
      thumbnailUrl,
      categoryId,
      vehicleId,
      uploaderId,
    } = req.body;

    const newDocument = await prisma.document.create({
      data: {
        title,
        description,
        fileUrl,
        fileKey,
        fileType,
        fileSize,
        thumbnailUrl,
        categoryId,
        vehicleId: vehicleId || null,
        uploaderId,
      },
    });
    res.status(201).json(newDocument);
  } catch (error) {
    console.error("[Knowledge] Error en createDocument:", error);
    res
      .status(500)
      .json({ error: "Error al guardar el documento en la base de datos" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const whereClause = { isActive: true };
    if (categoryId) whereClause.categoryId = categoryId;

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } }, // Quitamos el include de area
      },
      orderBy: { createdAt: "desc" },
    });
    res.status(200).json(documents);
  } catch (error) {
    console.error("[Knowledge] Error en getDocuments:", error);
    res.status(500).json({ error: "Error al obtener los documentos" });
  }
};

export const getCategories = async (req, res) => {
  try {
    const { areaId, all } = req.query;

    let whereClause = {};
    if (!all) {
      whereClause = areaId ? { areaId: areaId } : { areaId: null };
    }

    const categories = await prisma.documentCategory.findMany({
      where: whereClause,
      include: {
        area: true,
      },
      orderBy: { name: "asc" },
    });

    res.status(200).json(categories);
  } catch (error) {
    console.error("[Knowledge] Error en getCategories:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

export const getSidebarMenu = async (req, res) => {
  try {
    // 1. Traemos TODAS las categorías
    const allCategories = await prisma.documentCategory.findMany({
      orderBy: { name: "asc" },
    });

    // 2. Armamos el árbol infinito en memoria
    const categoryMap = new Map();

    // Primero, preparamos todos los nodos agregándoles un arreglo vacío de 'children'
    allCategories.forEach((cat) => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    const tree = [];

    // Luego, acomodamos cada hijo dentro de su padre
    allCategories.forEach((cat) => {
      if (cat.parentId) {
        const parent = categoryMap.get(cat.parentId);
        if (parent) {
          parent.children.push(categoryMap.get(cat.id));
        }
      } else {
        // Si no tiene padre, es una categoría Raíz (ej. "AUTOS NUEVOS")
        tree.push(categoryMap.get(cat.id));
      }
    });

    res.status(200).json(tree);
  } catch (error) {
    console.error("[Knowledge] Error en getSidebarMenu:", error);
    res.status(500).json({ error: "Error al armar el árbol de categorías" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, parentId } = req.body;
    const category = await prisma.documentCategory.create({
      data: { name, description, icon, parentId: parentId || null },
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la categoría." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, parentId, coverUrl } = req.body;

    const category = await prisma.documentCategory.update({
      where: { id },
      data: { name, description, icon, parentId: parentId || null, coverUrl },
    });
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la categoría." });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.documentCategory.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al eliminar la categoría." });
  }
};

export const getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;

    const category = await prisma.documentCategory.findUnique({
      where: { id },
      include: {
        children: {
          include: {
            documents: {
              where: { fileType: { startsWith: "image/" } },
              take: 1,
              select: { fileUrl: true },
            },
          },
        },
        // ==========================================
        // NUEVO: Traemos los vehículos de esta carpeta y sus PDFs
        // ==========================================
        vehicles: {
          include: {
            documents: true, // Trae los PDFs/Fotos vinculados a este auto
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!category)
      return res.status(404).json({ error: "Categoría no encontrada" });

    // (El código de los breadcrumbs se queda exactamente igual)
    const breadcrumbs = [];
    let currentParentId = category.parentId;
    while (currentParentId) {
      const parent = await prisma.documentCategory.findUnique({
        where: { id: currentParentId },
        select: { id: true, name: true, parentId: true },
      });
      if (parent) {
        breadcrumbs.unshift({ id: parent.id, name: parent.name });
        currentParentId = parent.parentId;
      } else {
        currentParentId = null;
      }
    }

    res.status(200).json({ ...category, breadcrumbs });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la categoría" });
  }
};
export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;

    // 1. Buscamos el documento para saber su fileKey
    const document = await prisma.document.findUnique({ where: { id } });
    if (!document) {
      return res.status(404).json({ error: "Documento no encontrado" });
    }

    // 2. Lo borramos físicamente de Cloudflare R2
    await deleteFileFromR2(document.fileKey);

    // 3. Lo borramos de la base de datos PostgreSQL
    await prisma.document.delete({ where: { id } });

    res
      .status(200)
      .json({ success: true, message: "Documento eliminado correctamente" });
  } catch (error) {
    console.error("[Knowledge] Error en deleteDocument:", error);
    res.status(500).json({ error: "Error al eliminar el documento" });
  }
};

export const searchKnowledge = async (req, res) => {
  try {
    const { q } = req.query; // El texto a buscar

    // Si no hay texto o es muy corto, devolvemos arreglos vacíos
    if (!q || q.length < 2) {
      return res.status(200).json({ categories: [], documents: [] });
    }

    // 1. Buscamos coincidencias en las Carpetas (Categorías)
    const categories = await prisma.documentCategory.findMany({
      where: { name: { contains: q, mode: "insensitive" } },
      take: 5, // Límite de 5 resultados para no saturar la vista
    });

    // 2. Buscamos coincidencias en los Documentos
    const documents = await prisma.document.findMany({
      where: {
        title: { contains: q, mode: "insensitive" },
        isActive: true,
      },
      include: {
        category: { select: { name: true } }, // Traemos el nombre de su carpeta
      },
      take: 5,
    });

    res.status(200).json({ categories, documents });
  } catch (error) {
    console.error("[Knowledge] Error en searchKnowledge:", error);
    res.status(500).json({ error: "Error al realizar la búsqueda" });
  }
};
export const createVehicle = async (req, res) => {
  try {
    const { name, description, coverUrl, engine, power, traction, categoryId } =
      req.body;

    const vehicle = await prisma.vehicle.create({
      data: {
        name,
        description,
        coverUrl,
        engine,
        power,
        traction,
        categoryId,
      },
    });

    res.status(201).json(vehicle);
  } catch (error) {
    console.error("[Knowledge] Error en createVehicle:", error);
    res.status(500).json({ error: "Error al crear el vehículo" });
  }
};

export const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.vehicle.delete({ where: { id } });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error("[Knowledge] Error en deleteVehicle:", error);
    res.status(500).json({ error: "Error al eliminar el vehículo" });
  }
};

export const getVehiclesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.query;
    if (!categoryId)
      return res.status(400).json({ error: "categoryId es requerido" });

    const vehicles = await prisma.vehicle.findMany({
      where: { categoryId },
      orderBy: { name: "asc" },
    });
    res.status(200).json(vehicles);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
};

export const updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, engine, power, traction, documentIds } = req.body;

    const vehicle = await prisma.vehicle.update({
      where: { id },
      data: {
        name,
        engine,
        power,
        traction,
        // Magia de Prisma: Desvincula los anteriores y vincula los nuevos IDs
        documents: {
          set: [], // Limpia las relaciones actuales
          connect: documentIds
            ? documentIds.map((docId) => ({ id: docId }))
            : [],
        },
      },
      include: { documents: true },
    });

    res.status(200).json(vehicle);
  } catch (error) {
    console.error("[Knowledge] Error en updateVehicle:", error);
    res.status(500).json({ error: "Error al actualizar el vehículo" });
  }
};

export const getVehicles = async (req, res) => {
  try {
    const { categoryId } = req.query;

    const where = {};
    if (categoryId) {
      where.categoryId = categoryId;
    }

    const vehicles = await prisma.vehicle.findMany({
      where,
      orderBy: { name: "asc" },
      select: { id: true, name: true, categoryId: true },
    });

    res.status(200).json(vehicles);
  } catch (error) {
    console.error("[Knowledge] Error en getVehicles:", error);
    res.status(500).json({ error: "Error al obtener los vehículos" });
  }
};

export const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, categoryId, vehicleId } = req.body;

    const document = await prisma.document.update({
      where: { id },
      data: {
        title,
        categoryId,
        vehicleId: vehicleId || null,
      },
    });

    res.status(200).json(document);
  } catch (error) {
    console.error("[Knowledge] Error en updateDocument:", error);
    res.status(500).json({ error: "Error al actualizar el documento" });
  }
};
