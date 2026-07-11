import { fetchJSON, API_URL } from '@core/http';
export const createPlace = async (data)   => fetchJSON(`${API_URL}/areas`, 'POST', data);
export const getPlaces = async () => {
  const res = await fetch(`${API_URL}/areas/tree`);
  if (!res.ok) throw new Error('Error al obtener departamentos');
  return res.json();
};