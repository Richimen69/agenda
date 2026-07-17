import { AccessToken } from "livekit-server-sdk";
import prisma from "./prisma.js";

// 1. Obtener TODAS las sesiones (Para el listado de tu panel administrativo)
export const getLiveSessions = async (req, res) => {
  try {
    const sessions = await prisma.liveSession.findMany({
      include: {
        advisor: { select: { id: true, name: true, email: true } },
        technician: { select: { id: true, name: true, email: true } },
        serviceType: true,
        currentStage: true
      },
      orderBy: { createdAt: 'desc' }
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
        serviceType: {
          include: {
            stages: {
              orderBy: { order: 'asc' }
            }
          }
        },
        currentStage: true
      }
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
      serviceTypeId
    } = req.body;

    if (!roomName || !customerName || !serviceTypeId) {
      return res.status(400).json({ error: "roomName, customerName y serviceTypeId son requeridos" });
    }

    // Buscamos automáticamente la primera etapa de ese servicio (order: 1)
    const initialStage = await prisma.serviceStage.findFirst({
      where: { serviceTypeId, order: 1 }
    });

    const session = await prisma.liveSession.create({
      data: {
        roomName,
        customerName,
        customerPhone: customerPhone || null,
        vehicleModel: vehicleModel || null,
        advisorId: advisorId || null,
        technicianId: technicianId || null,
        serviceTypeId,
        currentStageId: initialStage ? initialStage.id : null,
        status: "WAITING"
      }
    });

    res.status(201).json(session);
  } catch (error) {
    console.error("Error al crear sesión en vivo dinámica:", error);
    res.status(500).json({ error: "Failed to create live session" });
  }
};

// 4. Finalizar la sesión (Cambio de estado a FINISHED)
export const finishLiveSession = async (req, res) => {
  try {
    const { id } = req.params;

    const session = await prisma.liveSession.update({
      where: { id },
      data: { status: "FINISHED" }
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
      where: { id }
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
      return res.status(400).json({ error: "roomName y participantName son requeridos" });
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: "Configuración de LiveKit incompleta en el servidor" });
    }

    const at = new AccessToken(apiKey, apiSecret, {
      identity: participantName,
    });

    // Otorgamos permisos estándar de lectura y escritura para la sala
    at.addGrant({ 
      roomJoin: true, 
      room: roomName, 
      canPublish: true, 
      canSubscribe: true 
    });

    const token = await at.toJwt();
    res.json({ token });
  } catch (error) {
    console.error("Error al generar token de LiveKit:", error);
    res.status(500).json({ error: "Failed to generate video token" });
  }
};
export const getServiceTypes = async (req, res) => {
  try {
    const serviceTypes = await prisma.serviceType.findMany({
      include: {
        stages: {
          orderBy: { order: 'asc' } // Trae las etapas ordenadas secuencialmente
        }
      }
    });
    res.json(serviceTypes);
  } catch (error) {
    console.error("Error al obtener tipos de servicio:", error);
    res.status(500).json({ error: "Failed to fetch service types" });
  }
};

export const updateLiveSessionStage = async (req, res) => {
  try {
    const { id } = req.params;
    const { currentStageId } = req.body; // Recibe el ID de la tabla ServiceStage

    const session = await prisma.liveSession.update({
      where: { id },
      data: { currentStageId }
    });

    res.json({ message: "Service stage updated successfully", session });
  } catch (error) {
    console.error("Error al actualizar la etapa del servicio:", error);
    res.status(500).json({ error: "Failed to update service stage" });
  }
};

export const createServiceType = async (req, res) => {
  try {
    const { name, description, stages } = req.body; // 'stages' es un arreglo de textos: ['Recepción', 'Lavado', ...]

    if (!name || !stages || stages.length === 0) {
      return res.status(400).json({ error: "El nombre del servicio y al menos una etapa son obligatorios" });
    }

    const serviceType = await prisma.serviceType.create({
      data: {
        name,
        description: description || null,
        stages: {
          create: stages.map((stageName, index) => ({
            name: stageName,
            order: index + 1 // Asigna automáticamente el orden secuencial (1, 2, 3...)
          }))
        }
      },
      include: {
        stages: { orderBy: { order: 'asc' } }
      }
    });

    res.status(201).json(serviceType);
  } catch (error) {
    console.error("Error al crear tipo de servicio dinámico:", error);
    res.status(500).json({ error: "Failed to create service type" });
  }
};