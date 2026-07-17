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
