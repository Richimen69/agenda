import { PrismaClient } from '@prisma/client';
import { generatePresignedUrl } from '../../services/r2.service.js';

const prisma = new PrismaClient();

// ==========================================
// 1. GENERAR URL PREFIRMADA (Para subir a R2)
// ==========================================
export const getUploadUrl = async (req, res) => {
  try {
    const { fileName, fileType } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName y fileType son requeridos" });
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
    const { title, description, fileUrl, fileKey, fileType, fileSize, thumbnailUrl, categoryId, areaId, uploaderId } = req.body;

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
        areaId,
        uploaderId
      }
    });

    res.status(201).json(newDocument);
  } catch (error) {
    console.error("[Knowledge] Error en createDocument:", error);
    res.status(500).json({ error: "Error al guardar el documento en la base de datos" });
  }
};

export const getDocuments = async (req, res) => {
  try {
    const { categoryId } = req.query; // Recibimos el filtro opcional

    // Si hay categoryId, filtramos. Si no, traemos todos.
    const whereClause = { isActive: true };
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    const documents = await prisma.document.findMany({
      where: whereClause,
      include: {
        category: { select: { name: true } },
        area: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
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
        area: true 
      },
      orderBy: { name: 'asc' }
    });
    
    res.status(200).json(categories);
  } catch (error) {
    console.error("[Knowledge] Error en getCategories:", error);
    res.status(500).json({ error: "Error al obtener las categorías" });
  }
};

export const getSidebarMenu = async (req, res) => {
  try {
    // Traemos las áreas que tengan al menos una categoría creada
    const menu = await prisma.area.findMany({
      where: {
        documentCategories: {
          some: {} 
        }
      },
      select: {
        id: true,
        name: true,
        icon: true,
        documentCategories: {
          select: {
            id: true,
            name: true
          },
          orderBy: { name: 'asc' }
        }
      },
      orderBy: { name: 'asc' }
    });

    res.status(200).json(menu);
  } catch (error) {
    console.error("[Knowledge] Error en getSidebarMenu:", error);
    res.status(500).json({ error: "Error al obtener el menú lateral" });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, areaId } = req.body;
    const category = await prisma.documentCategory.create({
      data: { name, description, icon, areaId: areaId || null }
    });
    res.status(201).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la categoría. Verifica que no exista una con el mismo nombre en esa área." });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, icon, areaId } = req.body;
    const category = await prisma.documentCategory.update({
      where: { id },
      data: { name, description, icon, areaId: areaId || null }
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
      include: { area: true }
    });
    
    if (!category) return res.status(404).json({ error: "Categoría no encontrada" });
    
    res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al obtener la categoría" });
  }
};