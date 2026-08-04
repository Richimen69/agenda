import { fetchJSON, API_URL } from "@core/http";

export const getServiceTypes = async () => {
  return await fetchJSON(`${API_URL}/service-types`, "GET");
};

export const getLiveSessions = async () => {
  return await fetchJSON(`${API_URL}/live-sessions`, "GET");
};

export const getLiveSessionById = async (id) => {
  return await fetchJSON(`${API_URL}/live-sessions/${id}`, "GET");
};

export const createLiveSession = async (data) =>
  fetchJSON(`${API_URL}/live-sessions`, "POST", data);

export const updateLiveSessionStage = async (id, currentStageId) =>
  fetchJSON(`${API_URL}/live-sessions/${id}/stage`, "PATCH", { currentStageId });

export const finishLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}/finish`, "PATCH");

export const deleteLiveSession = async (id) =>
  fetchJSON(`${API_URL}/live-sessions/${id}`, "DELETE");

export const generateLiveKitToken = async (roomName, participantName, isTechnician) =>
  fetchJSON(`${API_URL}/live-sessions/token`, "POST", { roomName, participantName, isTechnician });

export const createServiceType = async (data) =>
  fetchJSON(`${API_URL}/service-types`, "POST", data);