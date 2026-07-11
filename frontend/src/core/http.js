const API_URL = import.meta.env.VITE_API_URL ?? "/api";

export const fetchJSON = async (url, method = "GET", body) => {
  const res = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    throw {
      response: {
        status: res.status,
        data: data,
      },
    };
  }

  return data;
};

export { API_URL };
