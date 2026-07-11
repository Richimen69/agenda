import { fetchJSON, API_URL } from "@core/http";

export const getTickets = async (userId) => {
  const res = await fetch(`${API_URL}/tickets?userId=${userId}`);
  if (!res.ok) throw new Error("Error al obtener tickets");
  return res.json();
};
export const getTicketById = async (ticketId) => {
  const res = await fetch(`${API_URL}/tickets/${ticketId}`);
  if (!res.ok) throw new Error("Error al obtener el ticket");
  return res.json();
};
export const createTicket = async (data) =>
  fetchJSON(`${API_URL}/tickets`, "POST", data);
export const deleteTicket = async (ticketId, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}`, "DELETE", { userId });
export const updateTicketStatus = async (ticketId, status, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/status`, "PATCH", {
    status,
    userId,
  });
export const updateTicketPriority = async (ticketId, priority, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/priority`, "PATCH", {
    priority,
    userId,
  });
export const updateTicketAssignees = async (ticketId, assigneeIds, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/assignees`, "PATCH", {
    assigneeIds,
    userId,
  });
export const addTicketComment = async (ticketId, userId, text) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/comments`, "POST", {
    userId,
    text,
  });
