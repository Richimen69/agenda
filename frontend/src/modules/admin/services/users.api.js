import { fetchJSON, API_URL } from "@core/http";

export const getUsers = async (moduleRoles) => {
  const query = moduleRoles?.length ? `?moduleRoles=${moduleRoles.join(",")}` : "";
  return await fetchJSON(`${API_URL}/users${query}`, "GET");
};

export const createUser = async (data) =>
  fetchJSON(`${API_URL}/users`, "POST", data);

export const deleteUser = async (userId) =>
  fetchJSON(`${API_URL}/users/${userId}`, "DELETE");

export const loginUser = async (email, password) => {
  try {
    const res = await fetchJSON(`${API_URL}/login`, "POST", { email, password });
    localStorage.setItem("token", res.data.token);
    return { success: true, data: res.data.user };
  } catch (err) {
    return {
      success: false,
      error: err.response?.data?.error || "Error de conexión con el servidor",
    };
  }
};

export const getUsersById = async (userId) =>
  await fetchJSON(`${API_URL}/users/${userId}`, "GET");

export const updateUser = async (userId, data) =>
  fetchJSON(`${API_URL}/users/${userId}`, "PATCH", data);