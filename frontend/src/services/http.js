const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export const fetchJSON = async (url, method = 'GET', body) => {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : {},
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
};

export { API_URL };