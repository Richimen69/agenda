import { useTechnicianSession } from "../hooks/useTechnicianSession";
import { LiveRoom } from "../components/LiveRoom";

/**
 * Pantalla fija que vive en el celular del técnico. Se accede por URL pública
 * SIN login (igual que tus roles client/technician/spectator), ej:
 * https://tudominio.com/?role=technician-kiosk&technicianId=abc123&name=Juan
 *
 * Por eso NO usa react-router (useSearchParams) — se monta fuera del
 * BrowserRouter, igual que el resto de tu bloque de interceptación en App.jsx.
 * Recibe technicianId/participantName ya leídos ahí con URLSearchParams.
 *
 * El técnico NUNCA recibe un link por sesión. Este componente pregunta solo
 * cada pocos segundos si el asesor le asignó un servicio, y en cuanto lo
 * detecta, monta LiveRoom (que ya auto-publica cámara/mic al ser isTechnician).
 * Al finalizar el servicio, regresa solo a la pantalla de espera.
 */
export function TechnicianKiosk({ technicianId, participantName = "Técnico" }) {
  const { session, loading, error } = useTechnicianSession(technicianId);

  if (!technicianId) {
    return (
      <KioskMessage
        title="Dispositivo sin configurar"
        message="Este celular no tiene un technicianId asignado. Pide al administrador que regenere el acceso directo desde el panel de Toyota Live."
        tone="error"
      />
    );
  }

  if (error) {
    return (
      <KioskMessage
        title="Sin conexión al servidor"
        message="No se pudo verificar si hay un servicio asignado. Revisa el WiFi del taller — este dispositivo reintentará solo."
        tone="error"
      />
    );
  }

  if (loading && !session) {
    return (
      <KioskMessage
        title="Verificando asignación..."
        message="Un momento."
        tone="loading"
      />
    );
  }

  if (!session) {
    return (
      <KioskMessage
        title="En espera de servicio"
        message="Este dispositivo se conectará automáticamente en cuanto el asesor registre un nuevo vehículo a tu nombre. No necesitas hacer nada."
        tone="waiting"
      />
    );
  }

  // Hay sesión asignada -> se conecta solo, publica cámara/mic sin intervención
  return (
    <LiveRoom
      roomName={session.id}
      participantName={participantName}
      isTechnician
      kioskMode
    />
  );
}

function KioskMessage({ title, message, tone }) {
  const toneStyles = {
    error: "border-red-200 bg-red-50 text-red-700",
    waiting: "border-gray-200 bg-white text-gray-700",
    loading: "border-gray-200 bg-white text-gray-500",
  };

  return (
    <div className="w-full h-screen bg-[#f8f9fa] flex items-center justify-center p-6">
      <div
        className={`max-w-sm w-full text-center border rounded-2xl p-8 shadow-sm ${toneStyles[tone]}`}
      >
        {tone === "waiting" && (
          <div className="w-3 h-3 bg-emerald-500 rounded-full mx-auto mb-4 animate-pulse" />
        )}
        {tone === "loading" && (
          <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        )}
        <h1 className="font-black text-lg tracking-tight mb-2">{title}</h1>
        <p className="text-xs leading-relaxed opacity-80">{message}</p>
      </div>
    </div>
  );
}