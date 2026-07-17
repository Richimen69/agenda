import { useState, useEffect, useCallback } from 'react';
import {
  getLiveSessions,
  createLiveSession,
  finishLiveSession,
  deleteLiveSession
} from '../services/live.api';
import { shareSessionViaWhatsApp } from '../utils/liveUrls';

/**
 * Encapsula el fetch, filtrado y operaciones CRUD de las sesiones
 * de Toyota Live. Los componentes de UI solo consumen este hook.
 *
 * onSessionsChange: callback opcional para notificar cambios globales
 * al componente padre de la app.
 */
export function useLiveSessions({ onSessionsChange } = {}) {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getLiveSessions();
      setSessions(data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const notifyChange = useCallback(() => {
    fetchSessions();
    if (onSessionsChange) onSessionsChange();
  }, [fetchSessions, onSessionsChange]);

  const createSession = useCallback(async (formData, advisorId) => {
    setLoading(true);
    try {
      const newSession = await createLiveSession({
        roomName: formData.roomName,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone || null,
        vehicleModel: formData.vehicleModel || null,
        advisorId, // Asignamos automáticamente el ID del usuario logueado
        technicianId: formData.technicianId || null,
        serviceTypeId: formData.serviceTypeId
      });

      notifyChange();

      if (newSession.customerPhone) {
        shareSessionViaWhatsApp(newSession);
      }

      return { success: true, session: newSession };
    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, [notifyChange]);

  const finishSession = useCallback(async (id) => {
    try {
      await finishLiveSession(id);
      notifyChange();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [notifyChange]);

  const deleteSession = useCallback(async (id) => {
    try {
      await deleteLiveSession(id);
      notifyChange();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [notifyChange]);

  const activeSessions = sessions.filter(s => s.status === 'WAITING' || s.status === 'ACTIVE');
  const finishedSessions = sessions.filter(s => s.status === 'FINISHED');

  return {
    sessions,
    activeSessions,
    finishedSessions,
    loading,
    fetchSessions,
    createSession,
    finishSession,
    deleteSession
  };
}