import { fetchJSON, API_URL } from "@core/http";

export const getEvents = async (userId) => {
  const res = await fetch(`${API_URL}/events?userId=${userId}`);
  if (!res.ok) throw new Error("Error al obtener eventos");
  return res.json();
};
export const createEvent = async (data) =>
  fetchJSON(`${API_URL}/events`, "POST", data);
export const updateEvent = async (data, idEvent) =>
  fetchJSON(`${API_URL}/events/${idEvent}`, "PUT", data);
export const deleteEvent = async (idEvent, id) =>
  fetchJSON(`${API_URL}/events/${idEvent}?userId=${id}`, "DELETE");
