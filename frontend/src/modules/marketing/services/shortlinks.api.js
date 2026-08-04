import { fetchJSON, API_URL } from '@core/http';

export const getLinks = async () => {
  const json = await fetchJSON(`${API_URL}/links`, "GET");
  return json.data;
};

export const getStats = async () => {
  const json = await fetchJSON(`${API_URL}/links/stats`, "GET");
  return json.data;
};

export const createLink = async (data) => {
  const json = await fetchJSON(`${API_URL}/links`, 'POST', data);
  return json.data;
};