import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function TicketList({ tickets, loading, onNewTicket }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  
  // NUEVO: Estado para controlar la vista actual
  const [viewMode, setViewMode] = useState('DEFAULT');

  // Obtenemos el mes y año actual para el filtro
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  // Lógica combinada de Búsqueda + Filtro de Vista
  const filteredTickets = tickets.filter(t => {
    // 1. Filtro de texto (Buscador)
    const matchesSearch = 
      t.folio.toString().includes(searchQuery) || 
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.creator?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    if (!matchesSearch) return false;

    // 2. Filtro de Vista (Dropdown)
    if (viewMode === 'DEFAULT') {
      // Lo que pediste: Diferente a cerrado Y solo del mes actual
      const ticketDate = new Date(t.createdAt);
      const isCurrentMonth = ticketDate.getMonth() === currentMonth && ticketDate.getFullYear() === currentYear;
      return t.status !== 'CERRADO' && isCurrentMonth;
    } 
    else if (viewMode === 'OPEN_ALL') {
      // Seguridad: Todos los que no estén cerrados (sin importar el mes)
      return t.status !== 'CERRADO';
    }
    
    // Si viewMode es 'ALL', mostramos todo (Histórico GLPI)
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto">
      {/* HEADER DASHBOARD */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Casos Registrados</h1>
          <p className="text-xs font-semibold text-brand uppercase tracking-wider mt-1">
            Soporte IT <span className="text-gray-400 mx-1">•</span>Casos
          </p>
        </div>
        <button 
          onClick={onNewTicket}
          className="px-6 py-2 bg-brand hover:bg-brand-hover text-white text-sm font-bold rounded-md shadow-sm transition flex items-center gap-2"
        >
          <span>+</span> Nuevo Ticket
        </button>
      </div>

      {/* CONTENEDOR DE LA TABLA */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        
        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-gray-50/50">
          
          {/* Buscador */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>
            <input
              type="text"
              placeholder="Buscar por ID, título o solicitante..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand sm:text-sm transition"
            />
          </div>

          {/* NUEVO: Selector de Vistas */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label className="text-xs font-bold text-gray-500 uppercase">Vista:</label>
            <select 
              value={viewMode}
              onChange={(e) => setViewMode(e.target.value)}
              className="p-2 bg-white border border-gray-300 rounded-md text-sm font-medium text-gray-700 focus:ring-2 focus:ring-brand outline-none cursor-pointer shadow-sm"
            >
              <option value="DEFAULT">Pendientes (Mes Actual)</option>
              <option value="OPEN_ALL">Todos los Pendientes</option>
              <option value="ALL">Histórico Completo</option>
            </select>
          </div>

        </div>

        {/* TABLA */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Título</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Tipo / Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Prioridad</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Solicitante</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Técnico</th>
                <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Apertura</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-gray-500">Cargando tickets...</td></tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
                    </svg>
                    <h3 className="text-sm font-bold text-gray-900">No se encontraron tickets en esta vista</h3>
                    <p className="mt-1 text-sm text-gray-500">Intenta cambiar el filtro de vista o buscar otro término.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((ticket) => (
                  <tr key={ticket.id} onClick={() => navigate(`/support/ticket/${ticket.id}`)} className="hover:bg-indigo-50/50 cursor-pointer transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{ticket.folio}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-md border
                        ${ticket.status === 'ABIERTO' ? 'bg-blue-50 text-blue-700 border-blue-200' : 
                          ticket.status === 'RESUELTO' ? 'bg-green-50 text-green-700 border-green-200' : 
                          ticket.status === 'CERRADO' ? 'bg-gray-100 text-gray-700 border-gray-300' :
                          'bg-yellow-50 text-yellow-700 border-yellow-200'}`}>
                        {ticket.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 font-medium">{ticket.title}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.caseType} / {ticket.category?.name || 'N/A'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">Media</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ticket.creator?.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{ticket.assignedTech?.name || 'Sin asignar'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(ticket.createdAt).toLocaleDateString('es-MX')}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}