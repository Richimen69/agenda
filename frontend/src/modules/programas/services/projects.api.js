import { fetchJSON, API_URL } from "@core/http";

export const createProject = async (data) =>
  fetchJSON(`${API_URL}/projects`, "POST", data);

export const getProjects = async () => {
  const json = await fetchJSON(`${API_URL}/projects`);
  return json.data; 
};

export const getMyProjects = async (userId) => {
  const json = await fetchJSON(`${API_URL}/projects?userId=${userId}`);
  return json.data;
};

export const createAction = async (projectId, data) => {
  const json = await fetchJSON(`${API_URL}/projects/${projectId}/actions`, 'POST', data);
  return json.data;
};

export const createKpi = async (actionId, data) => {
  const json = await fetchJSON(`${API_URL}/kpis/actions/${actionId}/kpis`, 'POST', data);
  return json.data;
};

export const addKpiRecord = async (kpiId, data) => {
  const json = await fetchJSON(`${API_URL}/kpis/${kpiId}/records`, 'POST', data);
  return json.data; // Te devuelve el registro y el mensaje de éxito
};

export const getActionTree = async (projectId) => {
  const json = await fetchJSON(`${API_URL}/projects/${projectId}/actions`);
  return json.data;
};

export const getProjectDetails = async (projectId) => {
  const json = await fetchJSON(`${API_URL}/projects/${projectId}`);
  return json.data; 
};