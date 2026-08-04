import { fetchJSON, API_URL } from "@core/http";

export const getLeads = async () => {
  return await fetchJSON(`${API_URL}/leads`, "GET");
};

export const deleteLead = async (leadId) =>
  fetchJSON(`${API_URL}/leads/${leadId}`, "DELETE");

export const updateLead = async (leadId, data) =>
  fetchJSON(`${API_URL}/leads/${leadId}`, "PUT", data);

export const createLead = async (data) =>
  fetchJSON(`${API_URL}/leads`, "POST", data);

export const checkDuplicatePhones = async (phones) => {
  return await fetchJSON(`${API_URL}/leads/check-duplicates`, "POST", { phones });
};

export const reactivateLead = async (leadId, payload) => {
  return await fetchJSON(`${API_URL}/leads/${leadId}/reactivate`, "POST", payload);
};

export const addLeadComment = async (leadId, payload) => {
  return await fetchJSON(`${API_URL}/leads/${leadId}/comments`, "POST", payload);
};