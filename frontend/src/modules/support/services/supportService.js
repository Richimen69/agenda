import { fetchJSON, API_URL } from "@core/http";

const SUPPORT_API = `${API_URL}/support`;

export const createSupportTicket = async (ticketData, files) => {
  const formData = new FormData();

  formData.append("title", ticketData.title);
  formData.append("description", ticketData.description);
  formData.append("creatorId", ticketData.creatorId);
  formData.append("categoryId", ticketData.categoryId);
  formData.append("caseType", ticketData.caseType);
  formData.append("source", ticketData.source);

  // NUEVO: Agregamos la fecha al envío
  if (ticketData.createdAt) {
    formData.append("createdAt", ticketData.createdAt);
  }

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
  }

  return await fetchJSON(`${SUPPORT_API}/tickets`, "POST", formData);
};

// 4. Agregar Comentario CON ARCHIVOS (El Ping-Pong)
export const addSupportComment = async (
  ticketId,
  text,
  authorId,
  authorRole,
  files,
) => {
  const formData = new FormData();

  formData.append("ticketId", ticketId);
  formData.append("text", text);
  formData.append("authorId", authorId);
  formData.append("authorRole", authorRole);

  if (files && files.length > 0) {
    Array.from(files).forEach((file) => {
      formData.append("files", file);
    });
  }

  return await fetchJSON(`${SUPPORT_API}/tickets/comments`, "POST", formData);
};

// 5. Cambiar el estado del ticket (Para que el técnico inicie el SLA o lo resuelva)
export const updateSupportTicketStatus = async (ticketId, status, techId) => {
  return await fetchJSON(`${SUPPORT_API}/tickets/${ticketId}/status`, "PATCH", {
    newStatus: status,
    techId,
  });
};

export const getSupportTickets = async (userId, role) => {
  return await fetchJSON(
    `${SUPPORT_API}/tickets?userId=${userId}&role=${role}`,
    "GET",
  );
};

/**
 * Obtiene el detalle completo de un ticket (Incluye el chat, archivos y datos del creador)
 */
export const getSupportTicketById = async (ticketId) => {
  return await fetchJSON(`${SUPPORT_API}/tickets/${ticketId}`, "GET");
};
export const getSupportCategories = async () => {
  return await fetchJSON(`${SUPPORT_API}/categories`, "GET");
};

export const getAllCategoriesAdmin = async () => {
  return await fetchJSON(`${SUPPORT_API}/admin/categories`, "GET");
};

export const createSupportCategory = async (data) => {
  return await fetchJSON(`${SUPPORT_API}/admin/categories`, "POST", data);
};

export const updateSupportCategory = async (id, data) => {
  return await fetchJSON(
    `${SUPPORT_API}/admin/categories/${id}`,
    "PATCH",
    data,
  );
};

export const getTechUsers = async () => {
  return await fetchJSON(`${SUPPORT_API}/admin/techs`, "GET");
};
export const getSupportMetrics = async () => {
  return await fetchJSON(`${SUPPORT_API}/metrics`, "GET");
};
