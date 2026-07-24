import { useEffect, useState } from "react";
import { LiveKitRoom, RoomAudioRenderer } from "@livekit/components-react";
import "@livekit/components-styles";
import { VideoPresets } from "livekit-client";
// 1. IMPORTACIÓN DE TU SERVICIO DE ENDPOINTS
import { generateLiveKitToken } from "@modules/live/services/live.api";

// 2. IMPORTACIÓN DE TUS COMPONENTES DE DISEÑO LOCALES
import { ClientLayout } from "./ClientLayout";
import { TechnicianLayout } from "./TechnicianLayout";

const LIVEKIT_SERVER_URL = import.meta.env.VITE_LIVEKIT_SERVER_URL;

export function LiveRoom({
  roomName,
  participantName,
  isTechnician,
  isSpectator = false,
  kioskMode = false,
}) {
  const [token, setToken] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        // Determinamos el rol de texto para la API
        const role = isTechnician
          ? "technician"
          : isSpectator
            ? "spectator"
            : "client";

        const response = await generateLiveKitToken(
          roomName,
          participantName,
          role,
        );
        setToken(response.token);
      } catch (err) {
        setError(err.message || "Error al conectar con el servidor de video");
      }
    }

    fetchToken();
  }, [roomName, participantName, isTechnician, isSpectator]);

  if (error) return <ConnectionError message={error} />;
  if (!token) return <ConnectionLoading />;

  return (
    <div className="w-full min-h-screen bg-[#f8f9fa] flex flex-col items-center justify-center p-4 overflow-y-auto">
      {/* Estilo para que el reproductor interno conserve el fondo oscuro por el contraste del video */}
      <style>{`
        .lk-video-container video, video {
          object-fit: contain !important;
          background-color: #020617 !important;
        }
      `}</style>

      {/* Cambiado a max-w-7xl y border-gray-200 para dar espacio a la consola de doble columna */}
      <div className="w-full max-w-7xl min-h-[85vh] md:min-h-[90vh] bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xl relative flex flex-col my-auto">
        <LiveKitRoom
          // Para el técnico forzamos la cámara TRASERA (environment) porque
          // el celular va en el arnés viendo hacia afuera — sin esto, LiveKit
          // pide por default la cámara frontal (facingMode: "user").
          video={
            isTechnician
              ? {
                  facingMode: "environment",
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                  frameRate: { ideal: 30 },
                }
              : false
          }
          audio={isTechnician} // El espectador/cliente no publica audio al entrar para evitar auricular
          token={token}
          serverUrl={LIVEKIT_SERVER_URL}
          data-lk-theme="default"
          options={{
            adaptiveStream: true,
            dynacast: true,
            publishDefaults: {
              simulcast: true,
              videoCodec: "h264",
              videoEncoding: VideoPresets.h1080.encoding,
              degradationPreference: "maintain-framerate",
            },
          }}
        >
          {isTechnician ? (
            <TechnicianLayout sessionId={roomName} kioskMode={kioskMode} />
          ) : (
            <ClientLayout sessionId={roomName} isSpectator={isSpectator} />
          )}
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}

// -------------------------------------------------------------------------
// 3. COMPONENTES AUXILIARES DE ESTADO (Diseño Claro / Toyota Kyojin Style)
// -------------------------------------------------------------------------

export function ConnectionError({ message }) {
  return (
    <div className="w-full h-screen bg-[#f8f9fa] flex items-center justify-center p-4">
      <div className="p-6 text-red-700 bg-red-50 border border-red-200 rounded-2xl max-w-md text-center shadow-lg">
        <p className="font-bold text-lg mb-1.5 tracking-tight">
          Error de Conexión
        </p>
        <p className="text-xs text-red-600 leading-relaxed">{message}</p>
      </div>
    </div>
  );
}

export function ConnectionLoading() {
  return (
    <div className="w-full h-screen bg-[#f8f9fa] flex items-center justify-center text-gray-500">
      <div className="flex flex-col items-center gap-3">
        {/* Spinner animado en color rojo Toyota */}
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Estableciendo conexión...
        </p>
      </div>
    </div>
  );
}
