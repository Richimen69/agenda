import { fetchJSON, API_URL } from '@core/http';

export const createPlace = async (data) => fetchJSON(`${API_URL}/areas`, 'POST', data);

export const getPlaces = async () => {
  return await fetchJSON(`${API_URL}/areas/tree`, "GET");
};