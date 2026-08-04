import { fetchJSON, API_URL } from "@core/http";

export const getTickets = async (userId) => {
  return await fetchJSON(`${API_URL}/tickets?userId=${userId}`, "GET");
};

export const getTicketById = async (ticketId) => {
  return await fetchJSON(`${API_URL}/tickets/${ticketId}`, "GET");
};

export const createTicket = async (data) =>
  fetchJSON(`${API_URL}/tickets`, "POST", data);

export const deleteTicket = async (ticketId, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}`, "DELETE", { userId });

export const updateTicketStatus = async (ticketId, status, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/status`, "PATCH", { status, userId });

export const updateTicketPriority = async (ticketId, priority, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/priority`, "PATCH", { priority, userId });

export const updateTicketAssignees = async (ticketId, assigneeIds, userId) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/assignees`, "PATCH", { assigneeIds, userId });

export const addTicketComment = async (ticketId, userId, text) =>
  fetchJSON(`${API_URL}/tickets/${ticketId}/comments`, "POST", { userId, text });