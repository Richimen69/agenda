import prisma from './prisma.js';
import crypto from 'crypto';

// Helper para generar códigos aleatorios (Base62)
const generateShortCode = (length = 6) => {
  const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars[crypto.randomInt(0, chars.length)];
  }
  return result;
};
export const getLinkStats = async (req, res) => {
  try {
    // 1. Total de enlaces creados
    const totalLinks = await prisma.shortLink.count();

    // 2. Suma de todos los clics
    const sumClicks = await prisma.shortLink.aggregate({ _sum: { clicks: true } });
    const totalClicks = sumClicks._sum.clicks || 0;

    // 3. Enlaces "muertos" (0 clics)
    const unusedLinks = await prisma.shortLink.count({ where: { clicks: 0 } });

    // 4. Top 5 Enlaces más exitosos
    const topLinks = await prisma.shortLink.findMany({
      where: { clicks: { gt: 0 } },
      orderBy: { clicks: 'desc' },
      take: 5,
      include: { user: { select: { name: true } } }
    });

    // Calcular promedio
    const avgClicks = totalLinks > 0 ? (totalClicks / totalLinks).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalLinks,
        totalClicks,
        unusedLinks,
        avgClicks,
        topLinks
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 1. CREAR ENLACE CORTO
export const createLink = async (req, res) => {
  try {
    // AHORA RECIBIMOS userId DESDE EL FRONTEND
    const { originalUrl, shortCode, userId } = req.body;

    if (!originalUrl) return res.status(400).json({ success: false, error: 'La URL original es requerida' });
    if (!userId) return res.status(400).json({ success: false, error: 'Falta el ID del usuario' });

    // Asegurar que la URL tenga http/https
    const formattedUrl = /^https?:\/\//i.test(originalUrl) ? originalUrl : `https://${originalUrl}`;
    let finalShortCode = shortCode;

    if (finalShortCode) {
      const exists = await prisma.shortLink.findUnique({ where: { shortCode: finalShortCode } });
      if (exists) return res.status(409).json({ success: false, error: 'El alias personalizado ya está en uso' });
    } else {
      let isUnique = false;
      while (!isUnique) {
        finalShortCode = generateShortCode();
        const exists = await prisma.shortLink.findUnique({ where: { shortCode: finalShortCode } });
        if (!exists) isUnique = true;
      }
    }

    const newLink = await prisma.shortLink.create({
      data: {
        originalUrl: formattedUrl,
        shortCode: finalShortCode,
        userId: userId, // Lo vinculamos al usuario que lo mandó
      },
    });

    res.status(201).json({ success: true, data: newLink });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 2. OBTENER TODOS LOS ENLACES
export const getLinks = async (req, res) => {
  try {
    const links = await prisma.shortLink.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } } // Traemos el nombre del creador
      }
    });
    res.json({ success: true, data: links });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// 3. REDIRECCIONAR AL ENLACE ORIGINAL (Público)
export const redirectLink = async (req, res) => {
  try {
    const { shortCode } = req.params;

    const link = await prisma.shortLink.findUnique({ where: { shortCode } });
    if (!link) return res.status(404).json({ success: false, error: 'Enlace no encontrado' });

    // Sumar 1 clic
    await prisma.shortLink.update({
      where: { id: link.id },
      data: { clicks: { increment: 1 } },
    });

    res.redirect(301, link.originalUrl);
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

