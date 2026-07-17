export function HistorySessionsTable({ sessions, onDelete }) {
  if (sessions.length === 0) {
    return (
      <div className="overflow-x-auto bg-white border border-gray-200 rounded-2xl shadow-sm">
        <p className="p-8 text-center text-gray-400 text-sm">El historial está vacío.</p>
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
            <th className="p-4">Servicio Realizado</th>
            <th className="p-4 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {sessions.map((session) => (
            <tr key={session.id} className="hover:bg-gray-50 text-gray-500">
              <td className="p-4 font-semibold text-gray-700">{session.roomName}</td>
              <td className="p-4">{session.customerName}</td>
              <td className="p-4">{session.technician?.name || 'Desconocido'}</td>
              <td className="p-4 font-semibold text-gray-600">{session.serviceType?.name || 'Mantenimiento'}</td>
              <td className="p-4 text-right">
                <button
                  onClick={() => onDelete(session.id)}
                  className="text-gray-400 hover:text-red-600 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}