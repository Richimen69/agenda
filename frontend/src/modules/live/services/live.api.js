import { fetchJSON, API_URL } from "@core/http";

// 1. Obtener catálogo de tipos de servicio y sus etapas ordenadas (Para el dropdown del Admin)
export const getServiceTypes = async () => {
  const res = await fetch(`${API_URL}/service-types`);
  if (!res.ok) throw new Error("Error al obtener los tipos de servicio");
  return res.json();
};

// 2. Obtener todas las transmisiones activas
export const getLiveSessions = async () => {
  const res = await fetch(`${API_URL}/live-sessions`);
  if (!res.ok) throw new Error("Error al obtener las sesiones en vivo");
  return res.json();
};

// 3. Obtener una sesión específica por su ID (Incluye el mapa dinámico de sus etapas)
export const getLiveSessionById = async (id) => {
  const res = await fetch(`${API_URL}/live-sessions/${id}`);
  if (!res.ok) throw new Error("Error al obtener la sesión en vivo");
  return res.json();
};

// 4. Crear una nueva sesión de transmisión en vivo (Asigna el serviceTypeId)
// data espera: { roomName, customerName, customerPhone, vehicleModel, advisorId, technicianId, serviceTypeId }
export const createLiveSession = async (data) =>
  fetchJSON(`${API_URL}/live-sessions`, "POST", data);

// 5. Actualizar la etapa del servicio (Envía el ID de la etapa actual: currentStageId)
export const updateLiveSessionStage = async (id, currentStageId) =>
  fetchJSON(`${API_URL}/live-sessions/${id}/stage`, "PATCH", { currentStageId });

// 6. Finalizar un servicio activo (Cambia el estado a FINISHED en la BD)
export const finishLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}/finish`, "PATCH");

// 7. Eliminar físicamente una sesión de la base de datos
export const deleteLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}`, "DELETE");

// 8. Generar el Token de acceso de LiveKit para unirse a la sala de video
export const generateLiveKitToken = async (roomName, participantName, isTechnician) =>
  fetchJSON(`${API_URL}/live-sessions/token`, "POST", {
    roomName,
    participantName,
    isTechnician,
  });

  export const createServiceType = async (data) =>
  fetchJSON(`${API_URL}/service-types`, "POST", data);