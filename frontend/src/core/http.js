// http.js
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const fetchJSON = async (url, method = "GET", body) => {
  const token = localStorage.getItem("token");

  const res = await fetch(url, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();

  if (!res.ok) {
    // Sesión inválida/expirada: limpia y fuerza vuelta al login
    if (res.status === 401) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw { response: { status: res.status, data } };
  }
  return data;
};

export { API_URL };
