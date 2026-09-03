// http.js
const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const fetchJSON = async (url, method = "GET", body) => {
  const token = localStorage.getItem("token");
  
  // NUEVO: Detectamos si el body es un FormData (para subida de archivos)
  const isFormData = body instanceof FormData;

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  // Solo agregamos application/json si hay body Y NO es FormData
  if (body && !isFormData) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    method,
    headers,
    // Si es FormData, lo pasamos crudo. Si es un objeto normal, lo convertimos a JSON.
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  });
  
  const data = await res.json();

  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem("authUser");
      localStorage.removeItem("token");
      window.location.href = "/";
    }
    throw { response: { status: res.status, data } };
  }
  return data;
};

export { API_URL };