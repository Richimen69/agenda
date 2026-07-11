import { AccessToken } from "livekit-server-sdk";
import prisma from "./prisma.js";

// 1. Obtener TODAS las sesiones (Para el listado de tu panel administrativo)
export const getLiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      include: {
        advisor: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(sessions);
  } catch (error) {
    console.error("Error al obtener sesiones en vivo:", error);
    res.status(500).json({ error: "Failed to fetch live sessions" });
  }
};

// 2. Obtener una sesión específica por su ID (UUID)
export const getLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.liveSession.findUnique({
      where: { id },
      include: {
        advisor: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
      },
    });

    if (!session) {
      return res.status(404).json({ error: "Live session not found" });
    }

    res.json(session);
  } catch (error) {
    console.error("Error al obtener sesión en vivo por ID:", error);
    res.status(500).json({ error: "Failed to fetch live session" });
  }
};

// 3. Crear una nueva sesión
export const createLiveSession = async (req, res) => {
  try {
    const {
      roomName,
      customerName,
      customerPhone,
      vehicleModel,
      advisorId,
      technicianId,
    } = req.body;

    if (!roomName || !customerName) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios: roomName o customerName" });
    }

    const session = await prisma.liveSession.create({
      data: {
        roomName,
        customerName,
        customerPhone: customerPhone || null,
        vehicleModel: vehicleModel || null,
        advisorId: advisorId || null,
        technicianId: technicianId || null,
        status: "WAITING",
      },
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error al crear sesión en vivo:", error);
    res.status(500).json({ error: "Failed to create live session" });
  }
};

// 4. Finalizar la sesión (Cambio de estado a FINISHED)
export const finishLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.liveSession.update({
      where: { id },
      data: { status: "FINISHED" },
    });

    res.json({ message: "Live session marked as finished", session });
  } catch (error) {
    console.error("Error al finalizar sesión en vivo:", error);
    res.status(500).json({ error: "Failed to finish live session" });
  }
};

// 5. Eliminar sesión
export const deleteLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.liveSession.delete({
      where: { id },
    });

    res.json({ message: "Live session deleted successfully" });
  } catch (error) {
    console.error("Error al eliminar sesión en vivo:", error);
    res.status(500).json({ error: "Failed to delete live session" });
  }
};

// 6. Generar Token de acceso de LiveKit
export const generateLiveKitToken = async (req, res) => {
  try {
    const { roomName, participantName, isTechnician } = req.body;

    if (!roomName || !participantName) {
      return res
        .status(400)
        .json({ error: "roomName y participantName son requeridos" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res
        .status(500)
        .json({ error: "Configuración de LiveKit incompleta en el servidor" });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // Otorgamos permisos estándar de lectura y escritura para la sala.
    // Esto garantiza compatibilidad del 100% con todas las versiones del SDK de LiveKit.
    at.addGrant({
      roomJoin: true,
      room: roomName,
      canPublish: true,
      canSubscribe: true,
    });

    const token = await at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error("Error al generar token de LiveKit:", error);
    res.status(500).json({ error: "Failed to generate video token" });
  }
};
