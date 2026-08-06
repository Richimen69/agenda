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
  return await fetchJSON(`${API_URL}/leads/check-duplicates`, "POST", {
    phones,
  });
};

export const reactivateLead = async (leadId, payload) => {
  return await fetchJSON(
    `${API_URL}/leads/${leadId}/reactivate`,
    "POST",
    payload,
  );
};

export const addLeadComment = async (leadId, payload) => {
  return await fetchJSON(
    `${API_URL}/leads/${leadId}/comments`,
    "POST",
    payload,
  );
};

export const getCampaignResults = async (month) =>
  await fetchJSON(`${API_URL}/leads/dashboard/campaigns?month=${month}`, "GET");

export const getRecoveryFunnel = async (month) =>
  await fetchJSON(`${API_URL}/leads/dashboard/recovery?month=${month}`, "GET");

export const getDigitalFunnel = async (month, department) => {
  const departmentParam = Array.isArray(department)
    ? department.join(",")
    : department;
  return await fetchJSON(
    `${API_URL}/leads/dashboard/digital-funnel?month=${month}&department=${departmentParam}`,
    "GET",
  );
};

export const getAmount = async (month, department) => {
  const departmentParam = Array.isArray(department)
    ? department.join(",")
    : department;
  return await fetchJSON(
    `${API_URL}/leads/kpi/generated-amount?month=${month}&department=${departmentParam}`,
    "GET",
  );
};

export const getLeadCount = async (month) => {
  return await fetchJSON(
    `${API_URL}/leads/kpi/leads-count?month=${month}`,
    "GET",
  );
};
