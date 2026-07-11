import { VideoTrack, useLocalParticipant, useMediaDeviceSelect } from '@livekit/components-react';
import { Track } from 'livekit-client';

export function TechnicianLayout() {
  const { localParticipant, isMicrophoneEnabled, isCameraEnabled } = useLocalParticipant();

  const {
    devices: cameras,
    activeDeviceId: activeCameraId,
    setActiveMediaDevice: setActiveCamera
  } = useMediaDeviceSelect({ kind: 'videoinput' });

  const {
    devices: microphones,
    activeDeviceId: activeMicId,
    setActiveMediaDevice: setActiveMic
  } = useMediaDeviceSelect({ kind: 'audioinput' });

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-900">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
        <h2 className="text-sm font-bold tracking-wider text-red-500">CONSOLA DE TRANSMISIÓN DEL TÉCNICO</h2>
        <span className="text-xs bg-slate-800 px-2.5 py-1 rounded-full text-slate-400">Rol: Emisor</span>
      </div>

      <div className="flex-1 bg-slate-950 flex items-center justify-center relative">
        {isCameraEnabled ? (
          <VideoTrack trackRef={{ participant: localParticipant, source: Track.Source.Camera }} className="w-full h-full" />
        ) : (
          <div className="text-slate-500 text-sm">Tu cámara está apagada</div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col md:flex-row items-stretch md:items-end justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-4 flex-1 md:flex-initial">
          <div className="flex flex-col gap-1.5 w-full sm:w-[240px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Origen de Video</label>
            <select
              value={activeCameraId}
              onChange={(e) => setActiveCamera(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer truncate"
            >
              {cameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Cámara ${camera.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 w-full sm:w-[260px]">
            <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Entrada de Audio (Micrófono)</label>
            <select
              value={activeMicId}
              onChange={(e) => setActiveMic(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-600 cursor-pointer truncate"
            >
              {microphones.map((mic) => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Micrófono ${mic.deviceId.slice(0, 5)}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-2 justify-end w-full md:w-auto">
          <button
            onClick={() => localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
              isMicrophoneEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isMicrophoneEnabled ? 'Silenciar Micrófono' : 'Activar Micrófono'}
          </button>
          <button
            onClick={() => localParticipant.setCameraEnabled(!isCameraEnabled)}
            className={`px-4 py-2 rounded-lg font-semibold text-xs transition-all cursor-pointer whitespace-nowrap ${
              isCameraEnabled ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
          >
            {isCameraEnabled ? 'Pausar Transmisión' : 'Reanudar Transmisión'}
          </button>
        </div>
      </div>
    </div>
  );
}