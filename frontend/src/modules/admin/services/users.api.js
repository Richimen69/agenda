import { fetchJSON, API_URL } from "@core/http";

export const getUsers = async () => {
  const res = await fetch(`${API_URL}/users`);
  if (!res.ok) throw new Error("Error al obtener usuarios");
  return res.json();
};
export const createUser = async (data) =>
  fetchJSON(`${API_URL}/users`, "POST", data);
export const deleteUser = async (userId) =>
  fetchJSON(`${API_URL}/users/${userId}`, "DELETE");
export const loginUser = async (email, password) =>
  fetchJSON(`${API_URL}/login`, "POST", { email, password });
