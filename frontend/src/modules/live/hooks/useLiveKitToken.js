import { useState, useEffect } from 'react';
import { generateLiveKitToken } from '../services/live.api';

/**
 * Solicita el token de LiveKit para conectarse a una sala.
 * Ignora respuestas tardías de fetches obsoletos (por cambio rápido
 * de roomName/participantName) con la bandera `cancelled`.
 */
export function useLiveKitToken(roomName, participantName, isTechnician) {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchToken() {
      setToken(null);
      setError(null);
      try {
        const response = await generateLiveKitToken(roomName, participantName, isTechnician);
        if (!cancelled) setToken(response.token);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Error al conectar con el servidor de video');
      }
    }

    fetchToken();
    return () => {
      cancelled = true;
    };
  }, [roomName, participantName, isTechnician]);

  return { token, error };
}