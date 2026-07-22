import { useRef, useState, useEffect } from "react";
import { RoomEvent, Track } from "livekit-client";
import { getLiveSessionById } from "../services/live.api";
import {
  useRoomContext,
  VideoTrack,
  useTracks,
  useLocalParticipant,
  useAudioPlayback,
} from "@livekit/components-react";
import {
  Mic,
  MicOff,
  Volume2,
  Maximize,
  Minimize,
  Check,
  Activity,
} from "lucide-react";
import { SessionFinished } from "../components/ConnectionStatus";
import espera from "@assets/espera.png";
import logo from "@assets/logo.png";

export function ClientLayout({ sessionId, isSpectator = false }) {
  const room = useRoomContext();
  const cameraTracks = useTracks([Track.Source.Camera]);
  const videoTrack = cameraTracks[0];
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();
  const { canPlayAudio, startAudio } = useAudioPlayback(room);

  const [session, setSession] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);
  const videoContainerRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [needsManualFullscreenTap, setNeedsManualFullscreenTap] =
    useState(false);
  console.log(session);
  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const sessionData = await getLiveSessionById(sessionId);
        setSession(sessionData);
        setCurrentStageId(sessionData.currentStageId);
      } catch (error) {
        console.error("Error al cargar la sesión:", error);
      }
    }
    loadSession();
  }, [sessionId]);

  useEffect(() => {
    const handleDataReceived = (payload) => {
      try {
        const decoder = new TextDecoder();
        const data = JSON.parse(decoder.decode(payload));
        if (data.type === "stage_change") {
          setCurrentStageId(data.stageId);
        }
      } catch (err) {
        console.error("Error decodificando mensaje:", err);
      }
    };

    room.on(RoomEvent.DataReceived, handleDataReceived);
    return () => room.off(RoomEvent.DataReceived, handleDataReceived);
  }, [room]);

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

  useEffect(() => {
    const mql = window.matchMedia("(orientation: landscape)");
    const handleOrientationChange = (e) => {
      if (e.matches) enterFullscreen();
      else exitFullscreen();
    };
    mql.addEventListener("change", handleOrientationChange);
    return () => mql.removeEventListener("change", handleOrientationChange);
  }, []);

  const enterFullscreen = () => {
    const element = videoContainerRef.current;
    if (!element || isFullscreen) return;

    const supportsNativeFullscreen =
      element.requestFullscreen || element.webkitRequestFullscreen;

    // iPhone Safari no soporta la Fullscreen API para <div>, usamos CSS
    if (!supportsNativeFullscreen) {
      setIsFullscreen(true);
      setNeedsManualFullscreenTap(false);
      return;
    }

    const request = element.requestFullscreen
      ? element.requestFullscreen()
      : element.webkitRequestFullscreen();

    Promise.resolve(request).catch(() => {
      setNeedsManualFullscreenTap(true);
    });
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else {
      setIsFullscreen(false);
    }
    setNeedsManualFullscreenTap(false);
  };

  const toggleFullscreen = () => {
    setNeedsManualFullscreenTap(false);
    if (isFullscreen) exitFullscreen();
    else enterFullscreen();
  };

  const toggleMic = () =>
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);

  const stages = session?.serviceType?.stages || [];

  if (!session || !session.serviceType || stages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-[#f8f9fa] h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[10px] md:text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cargando mapa de servicio...
          </p>
        </div>
      </div>
    );
  }

  if (session.status === "FINISHED")
    return <SessionFinished session={session} />;

  const activeStageIdx = stages.findIndex((s) => s.id === currentStageId);
  const percentage =
    stages.length > 0
      ? Math.round(((activeStageIdx + 1) / stages.length) * 100)
      : 0;

  // =====================================================================
  // DISEÑO 1: PANTALLA NORMAL (Blanco, Detallado, Vertical en Desktop)
  // =====================================================================
  const renderNormalProgress = () => (
    <div className="w-full lg:w-[320px] xl:w-[360px] bg-white p-4 lg:p-6 flex flex-col border-t lg:border-t-0 lg:border-l border-gray-200 shrink-0 overflow-y-auto z-0 transition-all duration-300">
      <div className="flex items-center justify-between mb-4 lg:mb-6">
        <div>
          <h3 className="text-sm lg:text-base font-black text-gray-900 tracking-tight">
            Avance General
          </h3>
          <p className="text-[10px] lg:text-xs text-gray-500 mt-0.5">
            Inspecciones del servicio
          </p>
        </div>
        <span className="bg-red-50 text-red-600 font-black text-xs lg:text-sm px-3 py-1.5 rounded-lg border border-red-100">
          {percentage}%
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-2 mb-4 lg:mb-6 overflow-hidden">
        <div
          className="bg-red-600 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <div
        className="flex lg:flex-col gap-3 lg:gap-4 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0"
        style={{ scrollbarWidth: "none" }}
      >
        {stages.map((s, idx) => {
          const isCurrent = s.id === currentStageId;
          const isPast =
            s.order <=
            (stages.find((item) => item.id === currentStageId)?.order || 1);
          const isLast = idx === stages.length - 1;

          return (
            <div
              key={s.id}
              className="flex lg:flex-row flex-col items-center lg:items-start flex-1 lg:flex-none min-w-[65px] group"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-6 h-6 lg:w-8 lg:h-8 rounded-full flex items-center justify-center font-bold text-[10px] lg:text-xs transition-all duration-300 shrink-0 ${
                    isCurrent
                      ? "bg-red-600 ring-4 ring-red-50 text-white shadow-lg"
                      : isPast
                        ? "bg-emerald-100 text-emerald-600"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {isPast && !isCurrent ? (
                    <Check className="w-3 h-3 lg:w-4 lg:h-4 font-black" />
                  ) : (
                    <span>{s.order}</span>
                  )}
                </div>
                {!isLast && (
                  <div
                    className={`hidden lg:block w-0.5 h-8 my-1 ${isPast && !isCurrent ? "bg-emerald-200" : "bg-gray-100"}`}
                  ></div>
                )}
              </div>
              <div className="mt-2 lg:mt-0 lg:ml-4 text-center lg:text-left flex flex-col justify-center lg:h-8">
                <span
                  className={`font-bold tracking-tight text-[9px] lg:text-xs leading-tight block ${isCurrent ? "text-red-600" : isPast ? "text-gray-800" : "text-gray-400"}`}
                >
                  {s.name}
                </span>
                {isCurrent && (
                  <span className="hidden lg:block text-[10px] text-red-400 font-semibold mt-0.5 animate-pulse">
                    En proceso...
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // =====================================================================
  // DISEÑO 2: PANTALLA COMPLETA (Oscuro, Flotante HUD, Muy compacto)
  // =====================================================================
  const renderFullscreenProgress = () => {
    const currentStageName =
      stages.find((s) => s.id === currentStageId)?.name || "Iniciando";

    return (
      <div className="absolute bottom-1 lg:w-100 md:w-60  rounded-2xl lg:p-4 md:p-2 shadow-2xl z-20 transition-all duration-500 ">
        {/* Mini puntos horizontales */}
        <div className="flex justify-between items-center gap-1">
          {stages.map((s) => {
            const isCurrent = s.id === currentStageId;
            const isPast =
              s.order <=
              (stages.find((item) => item.id === currentStageId)?.order || 1);
            console.log(s);
            return (
              <div>
                <p
                  className={`truncate leading-tight ${
                    isCurrent
                      ? "text-red-600 text-base font-bold mb-2"
                      : isPast
                        ? "text-gray-400 text-xs mb-2 line-through"
                        : "text-gray-300 text-xs mb-2"
                  }`}
                >
                  {s.name}
                </p>
                <div
                  key={s.id}
                  className="relative group flex-1 flex justify-center"
                >
                  <div
                    className={`w-2 h-2 md:w-2.5 md:h-2.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? "bg-red-500 scale-200 shadow-[0_0_8px_rgba(239,68,68,0.8)] mb-5"
                        : isPast
                          ? "bg-emerald-400 scale-150"
                          : "bg-slate-700 scale-170"
                    }`}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] p-2 sm:p-4 gap-3 sm:gap-5 overflow-y-auto relative">
      {/* ENCABEZADO SUPERIOR */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl p-3 md:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm shrink-0">
        <div className="flex items-center gap-3 md:gap-4">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-red-600 rounded-lg md:rounded-xl flex items-center justify-center shadow-md shrink-0">
            <span className="text-white font-black text-lg md:text-xl">T</span>
          </div>
          <div>
            <h1 className="text-sm md:text-lg font-black text-gray-900 tracking-tight leading-tight">
              {session.serviceType?.name}
            </h1>
            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5 md:mt-1">
              <span className="font-bold text-gray-800">
                {session.vehicleModel || ""}
              </span>{" "}
              ({session.roomName})
            </p>
          </div>
        </div>
      </div>

      {/* CONTENEDOR PRINCIPAL (Video + Progreso Normal) */}
      <div className="bg-white border border-gray-200 rounded-xl md:rounded-2xl shadow-sm flex flex-col lg:flex-row overflow-hidden relative min-h-0 h-full">
        {/* COLUMNA IZQUIERDA: ÁREA DE VIDEO */}
        <div className="flex flex-col flex-1 min-w-0 relative">
          {/* Cabecera del video */}
          <div className="flex items-center justify-between p-3 border-b border-gray-150 bg-gray-50/50 shrink-0">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-red-600 rounded-full animate-pulse"></span>
              <span className="font-bold tracking-wider text-[9px] md:text-xs text-gray-800 uppercase">
                Transmisión en curso, Tecnico: {session.technician?.name}
              </span>
            </div>
          </div>

          {/* WRAPPER FULLSCREEN NATIVO */}
          <div
            ref={videoContainerRef}
            className="relative flex-1 w-full bg-slate-950 flex items-center justify-center overflow-hidden group"
          >
            {/* Player */}
            {videoTrack ? (
              <VideoTrack
                trackRef={videoTrack}
                className="w-full h-full object-contain"
              />
            ) : (
              <img
                src={espera}
                alt="En espera"
                object-fill
                className="object-fill opacity-50"
              />
            )}

            {/* Logo */}
            <div className="absolute top-2 left-2 md:top-4 md:left-4 z-10 pointer-events-none">
              <img
                src={logo}
                alt="Logo"
                className="w-20 md:w-32 lg:w-44 drop-shadow-md"
              />
            </div>

            {needsManualFullscreenTap && !isFullscreen && (
              <button
                onClick={toggleFullscreen}
                className="absolute inset-0 bg-slate-950/85 flex flex-col items-center justify-center gap-3 text-white cursor-pointer z-20"
              >
                <Maximize className="w-8 h-8" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Toca para ver en pantalla completa
                </span>
              </button>
            )}

            {/* === RENDERIZA DISEÑO 2 SÓLO EN FULLSCREEN === */}
            {/* isFullscreen && videoTrack && renderFullscreenProgress()*/}

            {/* Controles Inferiores (Video) */}
            {videoTrack && (
              <div className="absolute bottom-0 left-0 right-0 p-2 md:p-4 flex flex-col sm:flex-row justify-between items-start sm:items-end gap-2 z-10 bg-gradient-to-t from-slate-900/95 via-slate-900/40 to-transparent">
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {!isSpectator && (
                    <button
                      onClick={toggleMic}
                      className={`flex items-center justify-center p-2.5 md:p-3 md:px-4 rounded-lg md:rounded-xl transition-all cursor-pointer shadow-lg ${
                        isMicrophoneEnabled
                          ? "bg-emerald-600 hover:bg-emerald-700"
                          : "bg-red-600 hover:bg-red-700"
                      }`}
                    >
                      {isMicrophoneEnabled ? (
                        <Mic className="w-4 h-4 md:w-5 md:h-5 text-white animate-pulse" />
                      ) : (
                        <MicOff className="w-4 h-4 md:w-5 md:h-5 text-white" />
                      )}
                    </button>
                  )}
                  <div className="bg-slate-900/80 border border-slate-700/60 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg flex items-center gap-1.5 md:gap-2 text-[9px] md:text-[10px] text-white font-bold backdrop-blur-sm shrink-0 shadow-lg">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${isMicrophoneEnabled ? "bg-emerald-400" : "bg-orange-400"}`}
                    ></span>
                    {isMicrophoneEnabled
                      ? "El técnico puede oírte"
                      : "Usted está silenciado"}
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 w-full sm:w-auto">
                  <div className="flex items-center gap-1.5 text-[9px] md:text-[10px] text-slate-200 font-bold bg-slate-900/80 border border-slate-700/60 px-2.5 py-1.5 md:px-3 md:py-2 rounded-lg backdrop-blur-sm shrink-0 shadow-lg">
                    <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                    En vivo
                  </div>
                  <button
                    onClick={toggleFullscreen}
                    className="bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 p-2 md:p-2.5 rounded-lg text-white transition-all cursor-pointer shadow-lg backdrop-blur-sm active:scale-95"
                  >
                    {isFullscreen ? (
                      <Minimize className="w-4 h-4 md:w-5 md:h-5" />
                    ) : (
                      <Maximize className="w-4 h-4 md:w-5 md:h-5" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === RENDERIZA DISEÑO 1 SÓLO FUERA DE FULLSCREEN === */}
        {/*!isFullscreen && videoTrack && renderNormalProgress()*/}
      </div>

      {/* OVERLAY DE AUDIO BLOQUEADO */}
      {!canPlayAudio && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-4 md:p-6 z-50 text-center rounded-xl md:rounded-2xl m-2 sm:m-4">
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-3 md:mb-4 animate-pulse shadow-md shadow-red-500/10">
            <Volume2 className="w-6 h-6 md:w-8 md:h-8" />
          </div>
          <h3 className="text-sm md:text-base font-black text-white tracking-tight">
            Audio en Pausa
          </h3>
          <p className="text-[10px] md:text-xs text-slate-300 max-w-xs mt-1.5 md:mt-2 leading-relaxed px-2 md:px-4 mb-4 md:mb-5">
            El navegador ha silenciado el canal de audio por seguridad. Presiona
            para escuchar la bahía en vivo.
          </p>
          <button
            onClick={startAudio}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-[10px] md:text-xs py-3 px-5 md:py-3.5 md:px-6 rounded-xl shadow-lg cursor-pointer transition-transform active:scale-95"
          >
            ACTIVAR AUDIO 🔊
          </button>
        </div>
      )}
    </div>
  );
}
