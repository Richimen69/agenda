// frontend/src/services/api.js

// Aqui centralizamos la URL base. En produccion, esto vendria de un archivo .env
const API_URL = 'http://localhost:3000/api';

export const getUsers = async () => {
  const response = await fetch(`${API_URL}/users`);
  if (!response.ok) throw new Error('Error al obtener usuarios');
  return response.json();
};

export const getTickets = async (userId) => {
  const response = await fetch(`${API_URL}/tickets?userId=${userId}`);
  if (!response.ok) throw new Error('Error al obtener tickets');
  return response.json();
};

export const createTicket = async (ticketData) => {
  const response = await fetch(`${API_URL}/tickets`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(ticketData),
  });
  return response.json();
};

export const updateTicketStatus = async (ticketId, status, userId) => {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, userId }),
  });
  return response.json();
};

export const createEvent = async (eventData) => {
  const response = await fetch(`${API_URL}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(eventData),
  });
  return response.json();
};

export const addTicketComment = async (ticketId, userId, text) => {
  const response = await fetch(`${API_URL}/tickets/${ticketId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId, text }),
  });
  return response.json();
};

export const getEvents = async (userId) => {
  const response = await fetch(`${API_URL}/events?userId=${userId}`);
  if (!response.ok) throw new Error('Error al obtener eventos');
  return response.json();
};

export const loginUser = async (email, password) => {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }), // Ahora enviamos el password
  });
  return response.json();
};

export const createUser = async (userData) => {
  const response = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });
  return response.json();
};

export const deleteUser = async (userId) => {
  const response = await fetch(`${API_URL}/users/${userId}`, { method: 'DELETE' });
  return response.json();
};