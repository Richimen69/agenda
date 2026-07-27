import { useEffect, useState, useRef } from "react";
import {
  VideoTrack,
  useLocalParticipant,
  useMediaDeviceSelect,
  useRoomContext,
  RoomAudioRenderer,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import {
  getLiveSessionById,
  updateLiveSessionStage,
  finishLiveSession,
} from "@modules/live/services/live.api";
import {
  VideoOff,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  Play,
  Check,
  LogOut,
  Settings,
} from "lucide-react";

export function TechnicianLayout({ sessionId, kioskMode = false }) {
  const room = useRoomContext();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();
  const wakeLockRef = useRef(null);
  const audioContextRef = useRef(null);
  const recognitionRef = useRef(null);
  const lastVoiceTriggerRef = useRef(0);

  const [kioskStarted, setKioskStarted] = useState(false);
  const [voiceConfirmation, setVoiceConfirmation] = useState(false);

  const startKioskSession = async () => {
    try {
      const AudioContextClass =
        window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
      await audioContextRef.current.resume();
    } catch (err) {
      console.warn("No se pudo desbloquear el audio:", err);
    }

    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (err) {
      console.warn("No se pudo activar pantalla completa:", err);
    }

    try {
      if ("wakeLock" in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request("screen");
      }
    } catch (err) {
      console.warn("No se pudo mantener la pantalla encendida:", err);
    }

    setKioskStarted(true);
  };

  useEffect(() => {
    if (!kioskMode) return;

    async function goFullscreenAndLock() {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.warn("No se pudo activar pantalla completa:", err);
      }
      try {
        if ("wakeLock" in navigator) {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        }
      } catch (err) {
        console.warn("No se pudo mantener la pantalla encendida:", err);
      }
    }

    goFullscreenAndLock();

    const handleVisibility = async () => {
      if (document.visibilityState === "visible" && "wakeLock" in navigator) {
        try {
          wakeLockRef.current = await navigator.wakeLock.request("screen");
        } catch (err) {
          console.warn("No se pudo re-adquirir wake lock:", err);
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      wakeLockRef.current?.release?.();
    };
  }, [kioskMode]);

  const [session, setSession] = useState(null);
  const [currentStageId, setCurrentStageId] = useState(null);
  const [loadingStage, setLoadingStage] = useState(false);

  const {
    devices: cameras,
    activeDeviceId: activeCameraId,
    setActiveMediaDevice: setActiveCamera,
  } = useMediaDeviceSelect({ kind: "videoinput" });

  const {
    devices: microphones,
    activeDeviceId: activeMicId,
    setActiveMediaDevice: setActiveMic,
  } = useMediaDeviceSelect({ kind: "audioinput" });

  useEffect(() => {
    async function loadSession() {
      if (!sessionId) return;
      try {
        const sessionData = await getLiveSessionById(sessionId);
        setSession(sessionData);
        setCurrentStageId(sessionData.currentStageId);
      } catch (error) {
        console.error("Error al cargar sesión en el técnico:", error);
      }
    }
    loadSession();
  }, [sessionId]);

  const handleStageChange = async (stageId) => {
    setLoadingStage(true);
    try {
      await updateLiveSessionStage(room.name, stageId);
      setCurrentStageId(stageId);

      const encoder = new TextEncoder();
      const payload = encoder.encode(
        JSON.stringify({ type: "stage_change", stageId }),
      );
      await localParticipant.publishData(payload, { reliable: true });
    } catch (error) {
      console.error("Error al cambiar de etapa:", error);
      alert("No se pudo actualizar la etapa.");
    } finally {
      setLoadingStage(false);
    }
  };

  const handleEndMaintenance = async () => {
    if (
      !confirm(
        "¿Estás seguro de que deseas finalizar por completo este mantenimiento? El cliente ya no podrá ver la transmisión.",
      )
    )
      return;
    try {
      await finishLiveSession(sessionId);
      alert("Mantenimiento finalizado con éxito.");

      if (kioskMode) {
        // no navegamos, el kiosco no tiene rutas internas
      } else {
        window.location.href = "/live";
      }
    } catch (error) {
      console.error("Error al finalizar mantenimiento:", error);
      alert("Error al finalizar el servicio.");
    }
  };

  const stages = session?.serviceType?.stages || [];
  const currentActiveStageIdx = stages.findIndex(
    (s) => s.id === currentStageId,
  );
  const isLastStage = currentActiveStageIdx === stages.length - 1;

  const advanceToNextStage = () => {
    if (isLastStage || !stages.length) return;
    handleStageChange(stages[currentActiveStageIdx + 1]?.id);

    try {
      const ctx = audioContextRef.current;
      if (ctx) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      }
    } catch (err) {
      console.warn("No se pudo reproducir el beep de confirmación:", err);
    }

    setVoiceConfirmation(true);
    setTimeout(() => setVoiceConfirmation(false), 2500);
  };

  useEffect(() => {
    if (!kioskMode) return;

    const handleKeyDown = (e) => {
      switch (e.key) {
        case "1":
          advanceToNextStage();
          break;
        case "2":
          localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
          break;
        case "3":
          localParticipant.setCameraEnabled(!isCameraEnabled);
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [
    kioskMode,
    stages,
    currentActiveStageIdx,
    isLastStage,
    isMicrophoneEnabled,
    isCameraEnabled,
    localParticipant,
  ]);

  const STAGE_TRIGGER_PHRASES = [
    "cambio de etapa",
    "siguiente etapa",
    "etapa completada",
    "avanzar etapa",
  ];
  const VOICE_COOLDOWN_MS = 4000;

  useEffect(() => {
    if (!kioskMode || !kioskStarted) return;

    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      console.warn(
        "Este navegador no soporta reconocimiento de voz (Web Speech API).",
      );
      return;
    }

    let stopped = false;
    const recognition = new SpeechRecognitionAPI();
    recognition.lang = "es-MX";
    recognition.continuous = true;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event) => {
      const lastResult = event.results[event.results.length - 1];
      if (!lastResult.isFinal) return;

      const transcript = lastResult[0].transcript
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      const matched = STAGE_TRIGGER_PHRASES.some((phrase) =>
        transcript.includes(phrase),
      );

      const now = Date.now();
      if (matched && now - lastVoiceTriggerRef.current > VOICE_COOLDOWN_MS) {
        lastVoiceTriggerRef.current = now;
        advanceToNextStage();
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed") {
        console.warn("Permiso de micrófono negado para comandos de voz.");
        stopped = true;
      }
    };

    recognition.onend = () => {
      if (!stopped && kioskMode) {
        try {
          recognition.start();
        } catch (err) {}
      }
    };

    try {
      recognition.start();
    } catch (err) {
      console.warn("No se pudo iniciar el reconocimiento de voz:", err);
    }

    return () => {
      stopped = true;
      recognition.onend = null;
      recognition.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kioskMode, kioskStarted]);

  if (!session) {
    return (
      <div className="flex-1 flex items-center justify-center text-slate-500 bg-gray-50 h-full">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Cargando consola...
          </p>
        </div>
      </div>
    );
  }

  if (kioskMode) {
    const currentStage = stages[currentActiveStageIdx] || null;

    if (!kioskStarted) {
      return (
        <button
          type="button"
          onClick={startKioskSession}
          className="flex flex-col items-center justify-center gap-4 h-full w-full bg-slate-950 text-white cursor-pointer"
        >
          <div className="w-16 h-16 rounded-full bg-red-600 flex items-center justify-center shadow-lg shadow-red-900/30">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
          <div className="text-center px-8">
            <h2 className="text-base font-black uppercase tracking-wide">
              Toca para iniciar tu turno
            </h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Un solo toque, al empezar. Después de esto ya no necesitas
              tocar la pantalla en todo el servicio.
            </p>
          </div>
        </button>
      );
    }

    return (
      <div className="flex flex-col h-full w-full bg-slate-950 text-white overflow-hidden">
        <RoomAudioRenderer />

        <div className="flex items-center justify-between px-4 py-3 bg-slate-900/90 border-b border-slate-800 shrink-0">
          <span className="text-[10px] font-black uppercase tracking-wide bg-red-600 px-2.5 py-1 rounded-lg">
            {session.roomName}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            En vivo
          </span>
        </div>

        {voiceConfirmation && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-30 bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-pulse">
            <CheckCircle2 className="w-4 h-4" />
            Etapa actualizada por voz
          </div>
        )}

        <div className="flex-1 relative bg-black flex items-center justify-center overflow-hidden min-h-0">
          {isCameraEnabled ? (
            <VideoTrack
              trackRef={{
                participant: localParticipant,
                source: Track.Source.Camera,
              }}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-slate-500 text-xs">Cámara en pausa</div>
          )}
        </div>

        <div className="bg-white text-gray-900 px-4 pt-5 pb-6 rounded-t-3xl shadow-[0_-8px_30px_rgba(0,0,0,0.3)] flex flex-col gap-3 shrink-0">
          <div className="text-center">
            <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
              {stages.length > 0
                ? `Paso ${currentActiveStageIdx + 1} de ${stages.length}`
                : "Servicio"}
            </span>
            <h2 className="text-lg font-black text-gray-900 tracking-tight mt-0.5 leading-tight">
              {currentStage?.name || "Servicio en curso"}
            </h2>
          </div>

          <button
            type="button"
            disabled={loadingStage || !currentStage}
            onClick={() => {
              if (isLastStage) {
                alert("¡Has completado la última etapa del servicio!");
              } else {
                handleStageChange(stages[currentActiveStageIdx + 1].id);
              }
            }}
            className="w-full bg-red-600 active:bg-red-800 disabled:bg-red-300 text-white font-black text-base py-5 rounded-2xl shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <CheckCircle2 className="w-6 h-6" />
            {loadingStage
              ? "Guardando..."
              : isLastStage
                ? "Última Etapa"
                : "Siguiente Etapa"}
          </button>

          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() =>
                localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
              }
              className={`py-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 transition-colors cursor-pointer border ${
                isMicrophoneEnabled
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-100 text-gray-500 border-gray-200"
              }`}
            >
              {isMicrophoneEnabled ? (
                <Mic className="w-5 h-5" />
              ) : (
                <MicOff className="w-5 h-5" />
              )}
              {isMicrophoneEnabled ? "Silenciar" : "Micrófono"}
            </button>
            <button
              type="button"
              onClick={handleEndMaintenance}
              className="py-4 rounded-2xl font-bold text-xs flex flex-col items-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-200 cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              Finalizar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] text-gray-900 font-sans p-4 gap-6">
      <RoomAudioRenderer />

      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-md shrink-0">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="white">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] bg-slate-900 text-white font-black px-2 py-0.5 rounded tracking-wide">
                Folio {session.roomName}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold px-2 py-0.5 rounded-full">
                ● Canal Activo
              </span>
            </div>
            <h1 className="text-lg md:text-xl font-black text-gray-900 tracking-tight leading-tight">
              {session.vehicleModel || "Vehículo Toyota"}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Cliente:{" "}
              <span className="font-bold text-gray-800">
                {session.customerName}
              </span>{" "}
              | Asesor:{" "}
              <span className="font-semibold text-gray-700">
                {session.advisor?.name || "Asesor Asignado"}
              </span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex flex-col text-right">
            <span className="text-[9px] uppercase font-bold text-gray-400 tracking-wider">
              Espectador / Cliente
            </span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              Conectado (Viendo en vivo)
            </span>
          </div>
          <button
            onClick={handleEndMaintenance}
            className="bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold py-2.5 px-4 rounded-xl shadow-md shadow-red-900/10 text-xs flex items-center gap-2 cursor-pointer transition-colors"
          >
            <LogOut className="w-4 h-4" />
            FINALIZAR MANTENIMIENTO
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col flex-1 gap-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-500" />
              Transmisión en Vivo
            </h3>

            <div className="flex-1 bg-slate-950 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
              {isCameraEnabled ? (
                <VideoTrack
                  trackRef={{
                    participant: localParticipant,
                    source: Track.Source.Camera,
                  }}
                  className="w-full h-full"
                />
              ) : (
                <div className="text-slate-500 text-xs">
                  Cámara en pausa
                </div>
              )}
            </div>

            {!kioskMode && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Origen de Video
                  </label>
                  <select
                    value={activeCameraId}
                    onChange={(e) => setActiveCamera(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-red-600 cursor-pointer truncate"
                  >
                    {cameras.map((camera) => (
                      <option key={camera.deviceId} value={camera.deviceId}>
                        {camera.label || `Cámara ${camera.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Entrada de Audio (Micrófono)
                  </label>
                  <select
                    value={activeMicId}
                    onChange={(e) => setActiveMic(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-red-600 cursor-pointer truncate"
                  >
                    {microphones.map((mic) => (
                      <option key={mic.deviceId} value={mic.deviceId}>
                        {mic.label || `Micrófono ${mic.deviceId.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mt-2">
              <button
                onClick={() =>
                  localParticipant.setCameraEnabled(!isCameraEnabled)
                }
                className={`py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                  isCameraEnabled
                    ? "bg-white hover:bg-gray-50 text-red-600 border-red-200"
                    : "bg-red-600 hover:bg-red-700 text-white border-transparent"
                }`}
              >
                {isCameraEnabled
                  ? "Pausar Transmisión"
                  : "Reanudar Transmisión"}
              </button>
              <button
                onClick={() =>
                  localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)
                }
                className={`py-3 rounded-xl font-bold text-xs transition-colors cursor-pointer border ${
                  isMicrophoneEnabled
                    ? "bg-white hover:bg-gray-50 text-emerald-600 border-emerald-200"
                    : "bg-emerald-600 hover:bg-emerald-750 text-white border-transparent"
                }`}
              >
                {isMicrophoneEnabled
                  ? "Silenciar Micrófono"
                  : "Activar Micrófono"}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 flex flex-col">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col h-full gap-4">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Procedimiento de Servicio (Checklist)
              </h3>
              <p className="text-[10px] text-gray-400 mt-1">
                Marque los avances para notificar dinámicamente al cliente.
              </p>
            </div>

            <div className="flex-1 space-y-3.5 overflow-y-auto max-h-[50vh] pr-1">
              {stages.map((stage, idx) => {
                const isCompleted = idx < currentActiveStageIdx;
                const isActive = stage.id === currentStageId;
                const isPending = idx > currentActiveStageIdx;

                return (
                  <div
                    key={stage.id}
                    className={`border rounded-xl p-4 transition-all ${
                      isActive
                        ? "border-red-500 bg-white shadow-md ring-4 ring-red-50"
                        : isCompleted
                          ? "border-gray-150 bg-gray-50/50 opacity-80"
                          : "border-gray-100 bg-white opacity-40"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <span className="text-[9px] uppercase font-bold text-gray-400">
                          Paso {stage.order}
                        </span>
                        <h4
                          className={`text-sm font-bold mt-0.5 ${isActive ? "text-gray-900" : "text-gray-700"}`}
                        >
                          {stage.name}
                        </h4>
                        <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                          {idx === 0 &&
                            "Verificación de 28 puntos clave de seguridad (fluidos, batería, luces, amortiguadores y mangueras)."}
                          {idx === 1 &&
                            "Extracción de neumáticos y desarme de frenos para medir el desgaste de pastillas y discos genuinos."}
                          {idx === 2 &&
                            "Instalación de repuestos y cambio de aceite de motor sintético Toyota Genuine."}
                          {idx === 3 &&
                            "Alineación de ruedas, balanceo y calibración de sensores de presión de aire (TPMS)."}
                          {idx === 4 &&
                            "Prueba estática y en ruta de los sistemas de seguridad activa y lavado exterior de cortesía."}
                        </p>
                      </div>

                      <div className="shrink-0 pt-1">
                        {isCompleted && (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                            <Check className="w-3.5 h-3.5 font-bold" />
                          </div>
                        )}

                        {isActive && (
                          <button
                            type="button"
                            disabled={loadingStage}
                            onClick={() => {
                              if (idx === stages.length - 1) {
                                alert(
                                  "¡Has completado la última etapa del servicio!",
                                );
                              } else {
                                handleStageChange(stages[idx + 1].id);
                              }
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {idx === stages.length - 1 ? "Listo" : "Listo"}
                          </button>
                        )}

                        {isPending && (
                          <button
                            type="button"
                            disabled={true}
                            className="bg-gray-100 text-gray-400 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-gray-200"
                          >
                            Iniciar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}