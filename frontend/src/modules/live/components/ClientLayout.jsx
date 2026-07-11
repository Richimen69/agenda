import { useRef } from 'react';
import { VideoTrack, useTracks, useLocalParticipant } from '@livekit/components-react';
import { Track } from 'livekit-client';
import { VideoOff, Mic, MicOff, Volume2, Maximize, Minimize } from 'lucide-react';
import { useFullscreen } from '../hooks/useFullscreen';

export function ClientLayout() {
  const cameraTracks = useTracks([Track.Source.Camera]);
  const videoTrack = cameraTracks[0];
  const { localParticipant, isMicrophoneEnabled } = useLocalParticipant();

  const videoContainerRef = useRef(null);
  const { isFullscreen, toggleFullscreen } = useFullscreen(videoContainerRef);

  const toggleMic = () => {
    localParticipant.setMicrophoneEnabled(!isMicrophoneEnabled);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      <div className="flex items-center justify-between p-4 border-b border-slate-800/80 bg-slate-900/20">
        <div className="flex items-center gap-2">
          {videoTrack && <span className="w-2.5 h-2.5 bg-red-600 rounded-full animate-pulse"></span>}
          <span className="font-bold tracking-wider text-xs md:text-sm text-slate-200">
            TRANSMISIÓN DE TALLER EN CURSO
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Volume2 className="text-red-500 w-4 h-4 animate-bounce" />
          <span className="text-[10px] bg-slate-800 px-2 py-1 rounded text-slate-400 font-bold uppercase tracking-wider">
            Taller Toyota Live
          </span>
        </div>
      </div>

      <div ref={videoContainerRef} className="flex-1 relative flex items-center justify-center bg-slate-950 overflow-hidden">
        {videoTrack ? (
          <>
            <VideoTrack trackRef={videoTrack} className="w-full h-full" />
            <button
              onClick={toggleFullscreen}
              className="absolute bottom-4 right-4 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/50 p-2.5 rounded-lg text-white transition-all cursor-pointer shadow-lg backdrop-blur-sm"
            >
              {isFullscreen ? <Minimize className="w-5 h-5 text-slate-200" /> : <Maximize className="w-5 h-5 text-slate-200" />}
            </button>
            {!isFullscreen && (
              <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/85 border border-slate-800 px-3 py-1.5 rounded-full shadow-md backdrop-blur-sm pointer-events-none">
                <span className="text-[10px] font-semibold text-slate-300 tracking-wider uppercase block text-center">
                  🔄 Gira tu celular para pantalla completa
                </span>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800/60 flex items-center justify-center mb-5">
              <VideoOff className="text-slate-600 w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-200 tracking-tight">Señal de Video en Pausa</h3>
            <p className="text-xs text-slate-400 max-w-md mt-2 leading-relaxed px-4">
              El técnico se encuentra en una pausa breve de inspección estática o calibrando la cámara de bahía. El audio sigue disponible.
            </p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-slate-800/60 bg-slate-900/40">
        <button
          onClick={toggleMic}
          className={`w-full flex items-center justify-center gap-2 font-bold py-3.5 px-4 rounded-xl transition-all cursor-pointer shadow-lg text-xs md:text-sm ${
            isMicrophoneEnabled
              ? 'bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800'
              : 'bg-red-600 hover:bg-red-700 active:bg-red-800'
          }`}
        >
          {isMicrophoneEnabled ? (
            <>
              <Mic className="w-5 h-5 animate-pulse" />
              <span>HABLANDO EN VIVO (PRESIONA PARA SILENCIAR)</span>
            </>
          ) : (
            <>
              <MicOff className="w-5 h-5 text-slate-200" />
              <span>HABLAR CON EL TÉCNICO POR AUDIO (LLAMAR)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}