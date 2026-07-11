import { fetchJSON, API_URL } from "@core/http";

export const getLiveSessions = async () => {
  const res = await fetch(`${API_URL}/live-sessions`);
  if (!res.ok) throw new Error("Error al obtener las sesiones en vivo");
  return res.json();
};

export const getLiveSessionById = async (id) => {
  const res = await fetch(`${API_URL}/live-sessions/${id}`);
  if (!res.ok) throw new Error("Error al obtener la sesión en vivo");
  return res.json();
};

export const createLiveSession = async (data) =>
  fetchJSON(`${API_URL}/live-sessions`, "POST", data);

export const finishLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}/finish`, "PUT");

export const deleteLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}`, "DELETE");

export const generateLiveKitToken = async (roomName, participantName, isTechnician) =>
  fetchJSON(`${API_URL}/live-sessions/token`, "POST", {
    roomName,
    participantName,
    isTechnician,
  });