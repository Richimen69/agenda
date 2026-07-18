import { useState, useEffect, useRef, useCallback } from "react";
import { getLiveSessions } from "../services/live.api";

/**
 * Vigila si existe una sesión (WAITING o ACTIVE) asignada a este técnico
 * y hace polling para detectar cambios sin que el técnico haga nada.
 *
 * Esto reemplaza el flujo de "el admin me manda un link por sesión":
 * el dispositivo del técnico ya sabe quién es (technicianId fijo, guardado
 * en el acceso directo / localStorage del celular) y pregunta solo.
 *
 * @param {string} technicianId - ID fijo del técnico asignado a este dispositivo
 * @param {number} pollIntervalMs - cada cuánto revisa (default 5s)
 */
export function useTechnicianSession(technicianId, pollIntervalMs = 5000) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  const checkSession = useCallback(async () => {
    if (!technicianId) return;
    try {
      const sessions = await getLiveSessions();
      // Buscamos la sesión activa/esperando asignada a este técnico.
      // (Idealmente esto se filtra en el backend: GET /live-sessions?technicianId=X&status=active
      // para no traer todo el listado cada 5s, pero mientras no exista el filtro, se hace aquí.)
      const mine = sessions.find(
        (s) =>
          s.technicianId === technicianId &&
          (s.status === "WAITING" || s.status === "ACTIVE"),
      );
      setSession(mine || null);
      setError(null);
    } catch (err) {
      setError(err.message || "Error al verificar sesión asignada");
    } finally {
      setLoading(false);
    }
  }, [technicianId]);

  useEffect(() => {
    checkSession(); // primer chequeo inmediato al encender

    intervalRef.current = setInterval(checkSession, pollIntervalMs);
    return () => clearInterval(intervalRef.current);
  }, [checkSession, pollIntervalMs]);

  return { session, loading, error, refresh: checkSession };
}