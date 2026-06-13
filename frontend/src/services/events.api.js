import { fetchJSON, API_URL } from './http';

export const getEvents   = async (userId) => {
  const res = await fetch(`${API_URL}/events?userId=${userId}`);
  if (!res.ok) throw new Error('Error al obtener eventos');
  return res.json();
};
export const createEvent = async (data) => fetchJSON(`${API_URL}/events`, 'POST', data);