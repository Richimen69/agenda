import { useRef, useState, useEffect } from "react";
import { useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { getLiveSessionById } from "../services/live.api";
import {
  VideoTrack,
  useTracks,
  useLocalParticipant,
  useAudioPlayback,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  Mic,
  MicOff,
  Volume2,
  Maximize,
  Minimize,
  Check,
  PhoneCall,
} from "lucide-react";
import {
  ConnectionError,
  ConnectionLoading,
  SessionFinished,
} from "../components/ConnectionStatus";
import espera from "@assets/espera.png";
import logo from "@assets/logo.png";

export function ClientLayout({ sessionId, isSpectator = false }) {
  const room = useRoomContext();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const videoTrack = cameraTracks[0];
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const { canPlayAudio, startAudio } = useAudioPlayback(room);
  const [session, setSession] = useState(null); // Almacenamos todo el objeto de la sesión
  const [currentStageId, setCurrentStageId] = useState(null);

  const videoContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 1. Cargar la sesión desde Postgres (Trae el tipo de servicio y sus etapas ordenadas)
  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const sessionData = await getLiveSessionById(sessionId);
        setSession(sessionData);
        setCurrentStageId(sessionData.currentStageId);
      } catch (error) {
        console.error("Error al cargar la sesión dinámica de Postgres:", error);
      }
    }
    loadSession();
  }, [sessionId]);

  // 2. Escuchar cambios de etapa en tiempo real vía WebSockets (LiveKit)
  useEffect(() => {
    const handleDataReceived = (payload) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === "stage_change") {
          setCurrentStageId(data.stageId); // Actualiza la etapa instantáneamente
        }
      } catch (err) {
        console.error("Error decodificando mensaje de datos:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => {
      room.off(RoomEvent.DataReceived, handleDataReceived);
    };
  }, [room]);

  // 3. Sincronizar el estado del fullscreen nativo del celular/navegador
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange,
      );
    };
  }, []);

  const toggleFullscreen = () => {
    const element = videoContainerRef.current;
    if (!element) return;

    if (!isFullscreen) {
      if (element.requestFullscreen) {
        element.requestFullscreen();
      } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen(); // Safari / iOS
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen(); // Safari / iOS
      }
    }
  };

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  const stages = session?.serviceType?.stages || [];

  // Si aún no carga los datos de la sesión, mostramos cargando de forma segura
  if (!session || !session.serviceType || stages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#f8f9fa] h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cargando mapa de servicio...
          </p>
        </div>
      </div>
    );
  }

  // CÁLCULO DINÁMICO DEL PORCENTAJE DE AVANCE
  const activeStageIdx = stages.findIndex((s) => s.id === currentStageId);
  const percentage =
    stages.length > 0
      ? Math.round(((activeStageIdx + 1) / stages.length) * 100)
      : 0;

  if (session.status === "FINISHED") {
    return <SessionFinished session={session} />;
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] p-4 gap-5 overflow-y-auto">
      {/* =========================================================================
          BLOQUE 1: ENCABEZADO SUPERIOR (Toyota Brand - Tema Blanco)
          ========================================================================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <div>
            <h1 className="text-lg font-black text-gray-900 tracking-tight leading-tight">
              {session.serviceType?.name}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-bold text-gray-800">
                {session.vehicleModel || ""}
              </span>{" "}
              ({session.roomName})
            </p>
          </div>
        </div>
      </div>

      {/* =========================================================================
          BLOQUE 2: TRANSMISIÓN DEL TALLER (Video + Controles)
          ========================================================================= */}
      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col overflow-hidden relative">
        <div className="flex items-center justify-between p-4 border-b border-gray-150 bg-gray-50/50">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>
            <span className="font-bold tracking-wider text-xs text-gray-800 uppercase">
              Transmisión de Taller en Curso
            </span>
          </div>
        </div>

        {/* Reproductor de Video */}
        <div
          ref={videoContainerRef}
          className="relative aspect-video flex items-center justify-center bg-slate-950 overflow-hidden"
        >
          {videoTrack ? (
            <>
              <VideoTrack trackRef={videoTrack} className="w-full h-full" />

              {/* Usted está silenciado */}
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] font-bold">
              <img src={logo} alt="" />
              </div>

              {/* Señal en tiempo real */}
              <div className="absolute bottom-4 right-16 flex items-center gap-2 text-[10px] text-slate-300 font-bold bg-slate-900/80 border border-slate-800/60 px-3 py-1.5 rounded-lg">
                SEÑAL EN TIEMPO REAL
              </div>

              <div className="absolute bottom-4 left-4 flex items-center gap-2 text-[10px] font-bold  px-3 py-1.5 rounded-lg">
                {!isSpectator && (
                  <div className="p-4">
                    <button
                      onClick={toggleMic}
                      className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg text-xs md:text-sm ${
                        isMicrophoneEnabled
                          ? "bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 shadow-emerald-950/10"
                          : "bg-red-600 hover:bg-red-700 active:bg-red-800 shadow-red-950/10"
                      }`}
                    >
                      {isMicrophoneEnabled ? (
                        <>
                          <Mic className="w-5 h-5 animate-pulse text-white" />
                        </>
                      ) : (
                        <>
                          <MicOff className="w-5 h-5 text-white" />
                        </>
                      )}
                    </button>
                  </div>
                )}
                <div className="top-4 left-4 bg-slate-900/80 border border-slate-800/60 px-3 py-1.5 rounded-lg flex items-center gap-2 text-[10px] text-orange-400 font-bold">
                  <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                  {isMicrophoneEnabled
                    ? "El tecnico puede oirte"
                    : "Usted está silenciado"}
                </div>
              </div>

              {/* Botón de Pantalla Completa */}
              <button
                onClick={toggleFullscreen}
                className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 p-2.5 rounded-lg text-white transition-all cursor-pointer shadow-lg"
              >
                {isFullscreen ? (
                  <Minimize className="w-4 h-4 text-slate-200" />
                ) : (
                  <Maximize className="w-4 h-4 text-slate-200" />
                )}
              </button>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <img src={espera} alt="" />
            </div>
          )}
        </div>
      </div>
      {!canPlayAudio && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 text-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4 animate-pulse shadow-md shadow-red-500/10">
            <Volume2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-black text-white tracking-tight">
            Audio en Pausa
          </h3>
          <p className="text-xs text-slate-400 max-w-xs mt-2 leading-relaxed px-4 mb-5">
            El navegador ha silenciado el canal de audio por seguridad. Presiona
            el botón para escuchar la bahía de servicio en vivo.
          </p>
          <button
            onClick={startAudio} // <-- Esta función nativa de LiveKit desbloquea el audio en el S.O.
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-red-600/20 cursor-pointer active:scale-95 transition-transform"
          >
            ACTIVAR AUDIO DE TRANSMISIÓN 🔊
          </button>
        </div>
      )}

      {/* =========================================================================
          BLOQUE 3: AVANCE GENERAL DEL MANTENIMIENTO (Progreso y Línea de Tiempo)
          ========================================================================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col gap-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900 tracking-tight">
              Avance General
            </h3>
            <p className="text-[10px] text-gray-500 mt-0.5">
              Porcentaje de puntos de inspección concluidos
            </p>
          </div>
          {/* Porcentaje Dinámico */}
          <span className="bg-red-600 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-md shadow-red-600/10 uppercase shrink-0">
            {percentage}% Completado
          </span>
        </div>

        {/* Barra de progreso visual */}
        <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
          <div
            className="bg-red-600 h-2.5 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          />
        </div>

        {/* Línea de tiempo secuencial de etapas */}
        <div className="flex justify-between items-start text-[9px] md:text-[10px] gap-2 mt-2">
          {stages.map((s, index) => {
            const isCurrent = s.id === currentStageId;
            const isPast =
              s.order <=
              (stages.find((item) => item.id === currentStageId)?.order || 1);

            return (
              <div
                key={s.id}
                className="flex flex-col items-center flex-1 text-center"
              >
                {/* Círculo indicador */}
                <div
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[8px] transition-all duration-300 ${
                    isCurrent
                      ? "bg-red-600 ring-4 ring-red-100 text-white scale-110"
                      : isPast
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isPast && !isCurrent ? (
                    <Check className="w-3 h-3 font-black" />
                  ) : (
                    <span>{s.order}</span>
                  )}
                </div>
                {/* Nombre de la etapa */}
                <span
                  className={`mt-2 font-bold tracking-tight max-w-[100px] leading-tight block ${
                    isCurrent
                      ? "text-red-500 font-extraboldScale-105"
                      : "text-gray-500 font-semibold"
                  }`}
                >
                  {s.name}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
