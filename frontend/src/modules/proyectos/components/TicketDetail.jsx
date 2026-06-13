import { useState } from 'react';
import { ArrowLeft, Bookmark, Edit2, Calendar, Send, Trash2, Plus, Users, CheckSquare, Square, X } from 'lucide-react';
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from 'lucide-react';
import { addSubtask, toggleSubtask, deleteSubtask, updateTicketAssignees } from '../../../services/api';
import { PRIORITY_CONFIG } from '../../../utils/constants';
import DeleteConfirmModal from '@modules/proyectos/components/DeleteConfirmModal';

const ICON_MAP = { ArrowDown, Minus, ArrowUp, AlertTriangle };

export default function TicketDetail({ ticket, users, activeUserId, onBack, onStatusChange, onAddComment, onDelete, onUpdate }) {
  const [commentText, setCommentText] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamIds, setEditTeamIds] = useState(ticket.assignees.map(a => a.id));

  const isCreator = ticket.creatorId === activeUserId;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const PriorityIcon = ICON_MAP[priorityConfig?.icon];

  const getInitials = (name) =>
    name ? name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase() : 'UN';

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText);
    setCommentText('');
  };

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await addSubtask(ticket.id, newSubtaskTitle, newSubtaskAssignee);
      if (res.success) {
        setNewSubtaskTitle('');
        setNewSubtaskAssignee('');
        setIsAddingSubtask(false);
        onUpdate();
      }
    } catch { alert('Error al agregar subtarea'); }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await toggleSubtask(subtaskId, !currentStatus, activeUserId);
      if (res.success) onUpdate(); else alert(res.error);
    } catch { alert('Error al actualizar subtarea'); }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await deleteSubtask(subtaskId, activeUserId);
      if (res.success) onUpdate(); else alert(res.error);
    } catch { alert('Error al borrar subtarea'); }
  };

  const handleSaveTeam = async () => {
    try {
      const res = await updateTicketAssignees(ticket.id, editTeamIds, activeUserId);
      if (res.success) { setIsEditingTeam(false); onUpdate(); }
      else alert(res.error);
    } catch { alert('Error al actualizar equipo'); }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">

      {/* HEADER */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg border cursor-pointer border-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-base font-bold text-gray-800 uppercase tracking-wider">{ticket.title}</p>
            <p className="text-sm text-gray-600">ID: <span className="font-semibold text-gray-900">#task-{ticket.id.split('-')[0]}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isCreator && (
            <button onClick={() => setIsDeleteModalOpen(true)} className="p-2 cursor-pointer text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors" title="Eliminar Proyecto">
              <Trash2 className="w-5 h-5" />
            </button>
          )}
          <span className="text-sm font-medium text-gray-500">Estado:</span>
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
            className="bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg px-4 py-2 border-none focus:ring-0 cursor-pointer appearance-none pr-8"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232563eb' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: 'right 0.5rem center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: '1.5em 1.5em',
            }}
          >
            <option value="NUEVO">Nuevo</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="REVISION">Revisión</option>
            <option value="COMPLETADO">Completado</option>
          </select>
        </div>
      </div>

      {/* PEOPLE CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Creador */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 flex items-center justify-center text-orange-500">
            <Bookmark className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(ticket.creator?.name)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Creado y asignado por</p>
            <p className="text-sm font-bold text-gray-900">{ticket.creator?.name}</p>
          </div>
        </div>

        {/* Equipo */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4 relative">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
            <Users className="w-5 h-5" />
          </div>
          {isEditingTeam ? (
            <div className="flex-1 bg-gray-50 p-2 rounded-lg border border-gray-200">
              <div className="max-h-20 overflow-y-auto space-y-1 mb-2">
                {users.map(u => (
                  <label key={u.id} className="flex items-center gap-2 text-xs cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editTeamIds.includes(u.id)}
                      onChange={() => setEditTeamIds(prev =>
                        prev.includes(u.id) ? prev.filter(id => id !== u.id) : [...prev, u.id]
                      )}
                      className="rounded text-indigo-600"
                    />
                    {u.name}
                  </label>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={handleSaveTeam} className="bg-indigo-600 text-white text-xs px-3 py-1 rounded font-bold">Guardar</button>
                <button onClick={() => setIsEditingTeam(false)} className="bg-gray-200 text-gray-700 text-xs px-3 py-1 rounded font-bold">Cancelar</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex -space-x-3 shrink-0">
                {ticket.assignees.map((assignee, index) => (
                  <div key={assignee.id}
                    className="w-10 h-10 rounded-full bg-indigo-600 border-2 border-white flex items-center justify-center text-white font-bold text-sm"
                    style={{ zIndex: 10 - index }} title={assignee.name}
                  >
                    {getInitials(assignee.name)}
                  </div>
                ))}
              </div>
              <div className="overflow-hidden flex-1">
                <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider truncate">
                  {ticket.assignees.length > 1 ? 'Responsables incorporados' : 'Responsable incorporado'}
                </p>
                <p className="text-sm font-bold text-gray-900 truncate">
                  {ticket.assignees.map(a => a.id === activeUserId ? `${a.name} (Tú)` : a.name).join(', ')}
                </p>
              </div>
              {isCreator && (
                <button onClick={() => setIsEditingTeam(true)} className="absolute top-4 right-4 text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1">
                  <Edit2 className="w-3 h-3" /> Editar
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT COLUMN */}
        <div className="lg:col-span-2 space-y-6">

          {/* Detalles */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Detalles del requerimiento</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {ticket.description || 'No hay descripcion detallada para este requerimiento.'}
            </p>
          </div>

          {/* Checklist */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                <CheckSquare className="w-4 h-4 text-indigo-600" /> Checklist de Tareas
              </h3>
              <button onClick={() => setIsAddingSubtask(!isAddingSubtask)} className="text-indigo-600 hover:text-indigo-800 text-xs font-bold flex items-center gap-1 cursor-pointer">
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {ticket.subtasks?.length === 0 && !isAddingSubtask && (
                <p className="text-sm text-gray-400 italic">No hay subtareas definidas.</p>
              )}
              {ticket.subtasks?.map(st => {
                const assigneeName = users.find(u => u.id === st.assigneeId)?.name;
                return (
                  <div key={st.id} className={`flex items-center justify-between p-3 rounded-xl border transition-colors group ${st.isDone ? 'bg-gray-50 border-gray-100' : 'bg-white border-gray-200 hover:border-indigo-200'}`}>
                    <div className="flex items-center gap-3 flex-1 cursor-pointer" onClick={() => handleToggleSubtask(st.id, st.isDone)}>
                      {st.isDone
                        ? <CheckSquare className="w-5 h-5 text-green-500 shrink-0" />
                        : <Square className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 shrink-0" />}
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${st.isDone ? 'text-gray-400 line-through' : 'text-gray-700'}`}>{st.title}</p>
                        {assigneeName && <p className="text-[10px] font-bold text-indigo-500 uppercase mt-0.5">Responsable: {assigneeName}</p>}
                      </div>
                    </div>
                    {isCreator && (
                      <button onClick={() => handleDeleteSubtask(st.id)} className="text-gray-300 hover:text-red-500 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })}
              {isAddingSubtask && (
                <div className="flex gap-2 items-center bg-indigo-50 p-3 rounded-xl border border-indigo-100 mt-4 animate-fade-in">
                  <input
                    type="text" autoFocus placeholder="Nueva tarea..."
                    value={newSubtaskTitle} onChange={(e) => setNewSubtaskTitle(e.target.value)}
                    className="flex-1 bg-white border-none rounded-lg p-2 text-sm focus:ring-2 focus:ring-indigo-500"
                  />
                  <select value={newSubtaskAssignee} onChange={(e) => setNewSubtaskAssignee(e.target.value)} className="w-32 bg-white cursor-pointer border-none rounded-lg p-2 text-xs focus:ring-2 focus:ring-indigo-500">
                    <option value="">Cualquiera</option>
                    {ticket.assignees.map(u => <option key={u.id} value={u.id}>{u.name.split(' ')[0]}</option>)}
                  </select>
                  <button onClick={handleAddSubtask} className="bg-indigo-600 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-indigo-700 cursor-pointer">Guardar</button>
                  <button onClick={() => setIsAddingSubtask(false)} className="text-gray-500 hover:text-gray-700 p-2 cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
              )}
            </div>
          </div>

          {/* Bitácora */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col h-[400px]">
            <div className="mb-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Bitacora de seguimiento ({ticket.comments?.length || 0})</h3>
              <p className="text-xs text-gray-400 mt-1">Soporte y discusiones tecnicas con el equipo en tiempo real</p>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
              {!ticket.comments || ticket.comments.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <p className="text-sm text-gray-400">Aun no hay comentarios en esta bitacora. Inicia el hilo abajo de ser necesario!</p>
                </div>
              ) : (
                ticket.comments.map(comment => (
                  <div key={comment.id} className="bg-gray-50 rounded-xl p-4">
                    <span className="font-bold text-indigo-600 text-xs block mb-1">{comment.user.name}</span>
                    <p className="text-gray-700 text-sm">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            <div className="relative mt-auto">
              <input
                type="text" placeholder="Escribe un comentario..."
                value={commentText} onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                className="w-full bg-gray-50 border-none rounded-xl py-4 pl-4 pr-14 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button onClick={handleSendComment} className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-10 flex items-center justify-center transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-6">Propiedades</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-sm text-gray-500">Fecha Limite</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {ticket.dueDate ? new Date(ticket.dueDate).toISOString().split('T')[0] : 'Sin asignar'}
                </div>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-sm text-gray-500">Fecha Inicio</span>
                <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  {new Date(ticket.createdAt).toISOString().split('T')[0]}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">Prioridad</span>
                <div className={`inline-flex items-center gap-1 px-3 py-2 rounded-full text-xs font-semibold ${priorityConfig?.bgClass}`}>
                  {PriorityIcon && <PriorityIcon size={14} />}
                  {priorityConfig?.label ?? ticket.priority}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => { setIsDeleteModalOpen(false); onDelete(ticket.id); }}
        ticketTitle={ticket.title}
      />

    </div>
  );
}