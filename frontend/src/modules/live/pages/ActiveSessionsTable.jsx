import { getSessionUrls, shareSessionViaWhatsApp } from '../utils/liveUrls';

export function ActiveSessionsTable({ sessions, onFinish }) {
  if (sessions.length === 0) {
    return (
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
        <p className="p-8 text-center text-gray-400 text-sm">No hay transmisiones activas en este momento.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
      <table className="w-full text-left border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50 text-gray-400 text-xs uppercase font-bold">
            <th className="p-4">Identificador</th>
            <th className="p-4">Cliente</th>
            <th className="p-4">Técnico</th>
            <th className="p-4">Enlaces de Monitoreo</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sessions.map((session) => (
            <ActiveSessionRow key={session.id} session={session} onFinish={onFinish} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ActiveSessionRow({ session, onFinish }) {
  const { techUrl, clientUrl } = getSessionUrls(session);

  return (
    <tr className="hover:bg-gray-50">
      <td className="p-4 font-semibold text-gray-900">
        {session.roomName}
        {session.vehicleModel && (
          <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold ml-2">
            {session.vehicleModel}
          </span>
        )}
      </td>
      <td className="p-4 text-gray-600">{session.customerName}</td>
      <td className="p-4 text-gray-500 font-semibold">{session.technician?.name || 'No asignado'}</td>
      <td className="p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[10px] uppercase text-gray-400 w-16">Transmisor</span>
          <a href={techUrl} className="text-red-600 hover:underline">Abrir Cámara Virtual (OBS)</a>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-[10px] uppercase text-gray-400 w-16">Receptor</span>
          <a
            href={clientUrl}
            target="_blank"
            rel="noreferrer"
            className="text-red-600 hover:underline truncate max-w-[200px]"
          >
            Link para Cliente
          </a>
        </div>
      </td>
      <td className="p-4 text-right space-x-2">
        {session.customerPhone && (
          <button
            onClick={() => shareSessionViaWhatsApp(session)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
          >
            WhatsApp
          </button>
        )}
        <button
          onClick={() => onFinish(session.id)}
          className="bg-gray-100 hover:bg-red-100 hover:text-red-700 text-gray-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
        >
          Finalizar
        </button>
      </td>
    </tr>
  );
}