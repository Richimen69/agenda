import { fetchJSON, API_URL } from '@core/http';

export const addSubtask    = async (ticketId, title, assigneeId) => fetchJSON(`${API_URL}/tickets/${ticketId}/subtasks`, 'POST', { title, assigneeId });
export const toggleSubtask = async (subtaskId, isDone, userId)   => fetchJSON(`${API_URL}/subtasks/${subtaskId}`, 'PATCH', { isDone, userId });
export const deleteSubtask = async (subtaskId, userId)           => fetchJSON(`${API_URL}/subtasks/${subtaskId}`, 'DELETE', { userId });