import { Circle, CheckCircle } from 'lucide-react';
import { PRIORITY_CONFIG, STATUS_CONFIG, getInitials } from '../../../utils/constants';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';

const ICON_MAP = { ArrowDown, Minus, ArrowUp, AlertTriangle };

export default function TicketCard({ ticket, activeUserId, onClick, variant = 'assignee' }) {
  const statusConfig   = STATUS_CONFIG[ticket.status]   ?? STATUS_CONFIG.NUEVO;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const IconoDinamico  = ICON_MAP[priorityConfig?.icon];

  const footer = variant === 'assignee' ? (
    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">Asignada por:</span>
        <div className="w-5 h-5 rounded-full bg-teal-500 text-white flex items-center justify-center text-[8px] font-bold">
          {getInitials(ticket.creator?.name)}
        </div>
        <span className="text-xs font-semibold text-gray-700">{ticket.creator?.name}</span>
      </div>
      <span className="text-[10px] font-bold text-gray-400">
        FV: {ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : 'Sin fecha'}
      </span>
    </div>
  ) : (
    <div className="flex justify-between items-center border-t border-gray-50 pt-3">
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400">
          {ticket.assignees.length === 1 ? 'Responsable:' : 'Responsables:'}
        </span>
        <span className="text-xs font-semibold text-gray-700">
          {ticket.assignees.map((a) => (a.id === activeUserId ? `${a.name} (Tú)` : a.name)).join(', ')}
        </span>
      </div>
      {ticket.status === 'REVISION' ? (
        <span className="text-[10px] font-bold bg-green-600 text-white px-2 py-1 rounded-md">Aprobar</span>
      ) : ticket.status === 'COMPLETADO' ? (
        <span className="text-[10px] font-bold text-green-500">✓ Resuelta</span>
      ) : (
        <span className="text-[10px] font-bold text-gray-400">
          Límite: {ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : 'Sin fecha'}
        </span>
      )}
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={`group border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all cursor-pointer bg-white
        ${variant === 'assignee' ? 'flex gap-4 hover:border-indigo-100' : 'hover:border-orange-100'}`}
    >
      {/* Ícono de estado (solo en mis tareas) */}
      {variant === 'assignee' && (
        <div className="pt-1">
          {ticket.status === 'COMPLETADO'
            ? <CheckCircle className="w-5 h-5 text-green-500" />
            : <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />}
        </div>
      )}

      <div className="flex-1">
        {/* Badges */}
        <div className="flex gap-2 mb-2">
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${statusConfig.className}`}>
            {statusConfig.label}
          </span>
          <span className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium ${priorityConfig?.bgClass}`}>
            {IconoDinamico && <IconoDinamico size={14} />}
            {priorityConfig?.label ?? ticket.priority}
          </span>
        </div>

        <h4 className={`font-bold text-gray-900 mb-3 transition-colors
          ${variant === 'assignee' ? 'group-hover:text-indigo-600' : 'group-hover:text-orange-600'}`}>
          {ticket.title}
        </h4>

        {footer}
      </div>
    </div>
  );
}