import { LiveKitRoom, RoomAudioRenderer } from '@livekit/components-react';
import { useLiveKitToken } from '../hooks/useLiveKitToken';
import { ConnectionError, ConnectionLoading } from './ConnectionStatus';
import { ClientLayout } from './ClientLayout';
import { TechnicianLayout } from './TechnicianLayout';
import '@livekit/components-styles';

const LIVEKIT_SERVER_URL = import.meta.env.VITE_LIVEKIT_SERVER_URL;

export function LiveRoom({ roomName, participantName, isTechnician }) {
  const { token, error } = useLiveKitToken(roomName, participantName, isTechnician);

  if (error) return <ConnectionError message={error} />;
  if (!token) return <ConnectionLoading />;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center text-white p-4">
      <style>{`
        .lk-video-container video, video {
          object-fit: contain !important;
          background-color: #020617 !important;
        }
      `}</style>

      <div className="w-full h-full bg-white border border-slate-800 rounded-2xl overflow-hidden shadow-2xl relative flex flex-col">
        <LiveKitRoom
          video={isTechnician}
          audio={true}
          token={token}
          serverUrl={LIVEKIT_SERVER_URL}
          data-lk-theme="default"
        >
          {isTechnician ? <TechnicianLayout /> : <ClientLayout />}
          <RoomAudioRenderer />
        </LiveKitRoom>
      </div>
    </div>
  );
}