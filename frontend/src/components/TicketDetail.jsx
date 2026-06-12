import { useState } from 'react';
import { 
  ArrowLeft, Bookmark, CheckCircle2, Edit2, 
  Calendar, Flame, Paperclip, Send 
} from 'lucide-react';

export default function TicketDetail({ ticket, onBack, onStatusChange, onAddComment, activeUserId }) {
  const [commentText, setCommentText] = useState('');

  const handleSendComment = () => {
    if (!commentText.trim()) return;
    onAddComment(ticket.id, commentText);
    setCommentText('');
  };

  // Obtener iniciales para los avatares
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 animate-fade-in">
      
      {/* HEADER */}
      <div className="bg-white rounded-2xl p-4 flex items-center justify-between border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rebranding Web SaaS</p>
            <p className="text-sm text-gray-600">Incidencia <span className="font-semibold text-gray-900">#task-{ticket.id.split('-')[0]}</span></p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Estado:</span>
          <select 
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
            className="bg-blue-50 text-blue-600 font-semibold text-sm rounded-lg px-4 py-2 border-none focus:ring-0 cursor-pointer appearance-none pr-8 relative"
            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%232563eb' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
          >
            <option value="NUEVO">Nuevo</option>
            <option value="EN_PROGRESO">En Progreso</option>
            <option value="REVISION">Revision</option>
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
            <p className="text-xs text-gray-400">Product Manager</p>
          </div>
        </div>

        {/* Responsable */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
            {getInitials(ticket.assignees[0]?.name)}
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Responsable incorporado</p>
            <p className="text-sm font-bold text-gray-900">
              {ticket.assignees[0]?.name} {ticket.assignees[0]?.id === activeUserId ? '(Tu)' : ''}
            </p>
            <p className="text-xs text-gray-400">Lead Developer</p>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Details & Comments) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Detalles */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">Detalles del requerimiento</h3>
              <button className="text-indigo-600 flex items-center gap-1 text-sm font-medium hover:text-indigo-700">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">{ticket.title}</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              {ticket.description || 'No hay descripcion detallada para este requerimiento.'}
            </p>
          </div>

          {/* Bitacora */}
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
                type="text" 
                placeholder="Escribe un comentario..." 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
                className="w-full bg-gray-50 border-none rounded-xl py-4 pl-4 pr-14 text-sm focus:ring-2 focus:ring-indigo-500"
              />
              <button 
                onClick={handleSendComment}
                className="absolute right-2 top-2 bottom-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg w-10 flex items-center justify-center transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Properties & Attachments) */}
        <div className="space-y-6">
          
          {/* Propiedades */}
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
                <div className="flex items-center gap-1 bg-red-50 text-red-600 px-3 py-1 rounded-lg text-sm font-semibold">
                  <Flame className="w-4 h-4" />
                  Urgente
                </div>
              </div>
            </div>
          </div>

          {/* Archivos Adjuntos */}
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">Archivos Adjuntos (0)</h3>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
              <Paperclip className="w-6 h-6 text-gray-400 mb-2" />
              <p className="text-sm font-bold text-gray-900">Subir documentos</p>
              <p className="text-xs text-gray-400 mt-1">Arrastra archivos aqui o haz clic</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}