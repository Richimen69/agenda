import { fetchJSON, API_URL } from "@core/http";

export const createProject = async (data) =>
  fetchJSON(`${API_URL}/proyectos`, "POST", data);