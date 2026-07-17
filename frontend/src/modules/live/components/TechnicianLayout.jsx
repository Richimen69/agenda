import { useEffect, useState, useRef } from "react";
import {
  VideoTrack,
  useLocalParticipant,
  useMediaDeviceSelect,
  useRoomContext,
} from "@livekit/components-react";
import { Track } from "livekit-client";
import { useNavigate } from "react-router-dom"; // Para redireccionar al finalizar
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

export function TechnicianLayout({ sessionId }) {
  const room = useRoomContext();
  const navigate = useNavigate();
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } =
    useLocalParticipant();

  // Estados para controlar los datos asíncronos de Postgres (Prisma)
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

  // 1. Cargar datos de la sesión de la base de datos
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

  // 2. Cambiar de etapa dinámicamente
  const handleStageChange = async (stageId) => {
    setLoadingStage(true);
    try {
      // A. Guardamos en Postgres (Prisma)
      await updateLiveSessionStage(room.name, stageId);
      setCurrentStageId(stageId);

      // B. Emitimos el evento de datos en tiempo real al cliente por LiveKit
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

  // 3. Finalizar el mantenimiento por completo
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
      navigate("/live"); // Redirecciona de vuelta al Panel de Control de Kyojin
    } catch (error) {
      console.error("Error al finalizar mantenimiento:", error);
      alert("Error al finalizar el servicio.");
    }
  };

  // Si los datos de Postgres aún no cargan, mostramos un spinner
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

  const stages = session?.serviceType?.stages || [];
  // Obtenemos la etapa activa actual
  const currentActiveStageIdx = stages.findIndex(
    (s) => s.id === currentStageId,
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-[#f8f9fa] text-gray-900 font-sans p-4 gap-6">
      {/* =========================================================================
          SECCIÓN 1: ENCABEZADO SUPERIOR (Toyota Brand - Tema Blanco)
          ========================================================================= */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-start gap-4">
          {/* Logo Toyota Cuadrado */}
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

        {/* Estatus del espectador y Botón de Terminar Servicio */}
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

      {/* =========================================================================
          SECCIÓN 2: GRID DE DOS COLUMNAS
          ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 flex-1">
        {/* COLUMNA IZQUIERDA (3/5): Video + Selectores de Hardware */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex flex-col flex-1 gap-4">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
              <Settings className="w-4 h-4 text-red-500" />
              Emisión Virtual OBS Studio
            </h3>

            {/* Monitor de video (Fondo oscuro para contraste del video) */}
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
                  La transmisión de OBS está en pausa
                </div>
              )}
            </div>

            {/* Selectores de Hardware */}
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

            {/* Botones de Muteo */}
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

        {/* COLUMNA DERECHA (2/5): Checklist dinámico del Procedimiento de Servicio */}
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

            {/* Tarjetas de Etapa */}
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

                      {/* Icono de estatus / Botones */}
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
                                handleStageChange(stages[idx + 1].id); // Avanza al siguiente paso
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
