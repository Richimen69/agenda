import { fetchJSON, API_URL } from '@core/http';

export const getLinks = async () => {
  const res = await fetch(`${API_URL}/links`);
  if (!res.ok) throw new Error('Error al obtener los enlaces');
  
  const json = await res.json();
  return json.data; 
};


export const getStats = async () => {
  const res = await fetch(`${API_URL}/links/stats`);
  if (!res.ok) throw new Error('Error al obtener las estadísticas');
  const json = await res.json();
  return json.data;
};

export const createLink = async (data) => {
  const json = await fetchJSON(`${API_URL}/links`, 'POST', data);
  return json.data;
};