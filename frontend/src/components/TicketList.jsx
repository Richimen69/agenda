import { useState } from 'react';
import { updateTicketStatus, createTicket } from '../services/api';
import { 
  Plus, X, CheckSquare, User, UserCheck, CheckCircle2, 
  Filter, Circle, CheckCircle
} from 'lucide-react';

export default function TicketList({ tickets, users, activeUserId, onStatusChange, onTicketSelect }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estados para el formulario del Modal
  const [title, setTitle] = useState('');
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // NUEVO: Estado para el filtro activo
  const [activeFilter, setActiveFilter] = useState('TODOS');

  // ================= LÓGICA DE DATOS Y KPIs (Sin filtrar) =================
  
  // 1. Todas Mis Tareas (Para los KPIs)
  const allMisTareas = tickets.filter(t => t.assignees.some(a => a.id === activeUserId));
  
  // 2. Todas las Delegadas (Para los KPIs)
  const allDelegadas = tickets.filter(t => t.creatorId === activeUserId && !t.assignees.some(a => a.id === activeUserId));
  
  // 3. Cálculos para KPIs (Siempre muestran el total real)
  const totalTareas = allMisTareas.length + allDelegadas.length;
  const completadas = [...allMisTareas, ...allDelegadas].filter(t => t.status === 'COMPLETADO').length;

  // ================= APLICAR EL FILTRO A LAS LISTAS =================
  
  const misTareas = allMisTareas.filter(t => activeFilter === 'TODOS' || t.status === activeFilter);
  const delegadas = allDelegadas.filter(t => activeFilter === 'TODOS' || t.status === activeFilter);

  // ================= HELPERS VISUALES =================
  const getInitials = (name) => {
    if (!name) return 'UN';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'NUEVO': return 'bg-gray-50 text-gray-600 border-gray-200';
      case 'EN_PROGRESO': return 'bg-blue-50 text-blue-600 border-blue-200';
      case 'REVISION': return 'bg-yellow-50 text-yellow-600 border-yellow-200';
      case 'COMPLETADO': return 'bg-green-50 text-green-600 border-green-200';
      default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
  };

  const formatStatus = (status) => {
    return status.replace('_', ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  };

  // Opciones del filtro
  const filterOptions = [
    { label: 'Todos', value: 'TODOS' },
    { label: 'Nuevos', value: 'NUEVO' },
    { label: 'En Progreso', value: 'EN_PROGRESO' },
    { label: 'En Revisión', value: 'REVISION' },
    { label: 'Completados', value: 'COMPLETADO' }
  ];

  // ================= HANDLERS DEL MODAL =================
  const handleAssigneeChange = (userId) => {
    setAssigneeIds((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]);
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    if (assigneeIds.length === 0) return alert('Selecciona al menos un responsable.');
    setIsSubmitting(true);
    try {
      const result = await createTicket({
        title, creatorId: activeUserId, assigneeIds, dueDate: dueDate ? new Date(dueDate).toISOString() : null
      });
      if (result.success) {
        setTitle(''); setAssigneeIds([]); setDueDate(''); setIsModalOpen(false); onStatusChange();
      }
    } catch (error) {
      alert('Error al crear el proyecto.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="space-y-6">
      
      {/* CABECERA Y BOTÓN NUEVO */}
      <div className="flex justify-end mb-2">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* ================= KPIs (4 TARJETAS) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Total Tareas</p>
            <p className="text-3xl font-bold text-gray-900">{totalTareas}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-500">
            <CheckSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider mb-1">Debo Hacer (Asignado)</p>
            <p className="text-3xl font-bold text-gray-900">{allMisTareas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
            <User className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">Mandé a Hacer (Delegado)</p>
            <p className="text-3xl font-bold text-gray-900">{allDelegadas.length}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex justify-between items-center">
          <div>
            <p className="text-[10px] font-bold text-green-500 uppercase tracking-wider mb-1">Completadas</p>
            <p className="text-3xl font-bold text-gray-900">{completadas}</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-500">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* ================= BARRA DE FILTROS (Interactiva) ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>Filtros Activos: <strong className="text-gray-900">
            {activeFilter === 'TODOS' ? 'Todos los Proyectos' : `Estado: ${formatStatus(activeFilter)}`}
          </strong></span>
        </div>
        
        <div className="flex items-center gap-4 text-xs font-medium text-gray-500 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2">
            <span>Estado:</span>
            {filterOptions.map(opt => (
              <span 
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-bold ${
                  activeFilter === opt.value 
                    ? 'bg-indigo-50 text-indigo-600 shadow-sm' 
                    : 'hover:bg-gray-50 text-gray-500'
                }`}
              >
                {opt.label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ================= COLUMNAS DE TAREAS ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* COLUMNA IZQUIERDA: MIS TAREAS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Mis Tareas (Responsable)</h3>
                <p className="text-xs text-indigo-600 font-medium">Tareas asignadas a ti • Debes resolverlas</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {misTareas.length}
            </span>
          </div>

          <div className="space-y-4">
            {misTareas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                {activeFilter === 'TODOS' ? 'No tienes tareas asignadas.' : `No hay tareas con estado "${formatStatus(activeFilter)}".`}
              </p>
            ) : (
              misTareas.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => onTicketSelect(ticket)}
                  className="group border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer bg-white flex gap-4"
                >
                  <div className="pt-1">
                    {ticket.status === 'COMPLETADO' ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex gap-2 mb-2">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getStatusColor(ticket.status)}`}>
                        {formatStatus(ticket.status)}
                      </span>
                    </div>
                    <h4 className="font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">{ticket.title}</h4>
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
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* COLUMNA DERECHA: PROYECTOS DELEGADOS */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Proyectos Delegados (Creador)</h3>
                <p className="text-xs text-orange-500 font-medium">Tareas que asignaste a otros • Debes revisar</p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              {delegadas.length}
            </span>
          </div>

          <div className="space-y-4">
            {delegadas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                {activeFilter === 'TODOS' ? 'No has delegado tareas a otros.' : `No hay tareas delegadas con estado "${formatStatus(activeFilter)}".`}
              </p>
            ) : (
              delegadas.map(ticket => (
                <div 
                  key={ticket.id} 
                  onClick={() => onTicketSelect(ticket)}
                  className="group border border-gray-100 rounded-2xl p-4 hover:shadow-md hover:border-orange-100 transition-all cursor-pointer bg-white"
                >
                  <div className="flex gap-2 mb-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-md border ${getStatusColor(ticket.status)}`}>
                      {formatStatus(ticket.status)}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 mb-3 group-hover:text-orange-600 transition-colors">{ticket.title}</h4>
                  <div className="flex justify-between items-center border-t border-gray-50 pt-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Responsable:</span>
                      <div className="w-5 h-5 rounded-full bg-purple-500 text-white flex items-center justify-center text-[8px] font-bold">
                        {getInitials(ticket.assignees[0]?.name)}
                      </div>
                      <span className="text-xs font-semibold text-gray-700">{ticket.assignees[0]?.name || 'Varios'}</span>
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
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      {/* MODAL EMERGENTE PARA CREAR PROYECTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">Crear Nuevo Proyecto</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <form onSubmit={handleCreateProject} className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Título del Proyecto</label>
                <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Ej: Rediseño de la web" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Asignar a (Múltiples)</label>
                <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-xl">
                  {users.map(user => (
                    <label key={user.id} className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors">
                      <input type="checkbox" checked={assigneeIds.includes(user.id)} onChange={() => handleAssigneeChange(user.id)} className="rounded text-indigo-600 w-4 h-4" />
                      <span className="text-sm font-medium text-gray-700">{user.name}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Fecha Límite (Opcional)</label>
                <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500" />
              </div>
              
              <div className="pt-2">
                <button type="submit" disabled={isSubmitting} className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 transition-colors">
                  {isSubmitting ? 'Creando...' : 'Crear Proyecto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}