// src/support/pages/TicketDetail.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getSupportTicketById, updateSupportTicketStatus } from '../services/supportService';
import TicketChat from '../components/TicketChat';
import CommentInput from '../components/CommentInput';

export default function TicketDetail() {
  const { id } = useParams(); // Obtenemos el ID del ticket desde la URL
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const currentUser = JSON.parse(localStorage.getItem('authUser')) || { id: '1', role: 'TECH', name: 'Técnico Carlos' };

  const fetchTicketDetail = async () => {
    try {
      const data = await getSupportTicketById(id);
      setTicket(data.data || data);
    } catch (error) {
      console.error("Error cargando detalle:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicketDetail();
  }, [id]);

  const handleStatusChange = async (newStatus) => {
    try {
      await updateSupportTicketStatus(id, newStatus, currentUser.id);
      fetchTicketDetail(); // Recargar para ver el nuevo estado
    } catch (error) {
      alert("Error al actualizar el estado");
    }
  };

  if (loading) return <div className="p-6 text-center">Cargando detalles...</div>;
  if (!ticket) return <div className="p-6 text-center text-red-500">Ticket no encontrado</div>;

  const isTechOrAdmin = currentUser.role === 'TECH' || currentUser.role === 'ADMIN';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-600 hover:underline flex items-center gap-1">
        ← Volver a la lista
      </button>

      {/* Cabecera del Ticket */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">#{ticket.folio} - {ticket.title}</h1>
            <p className="text-sm text-gray-500 mt-1">Creado por {ticket.creator?.name} el {new Date(ticket.createdAt).toLocaleString()}</p>
          </div>
          
          {/* Controles de Estado (Solo para Técnicos) */}
          {isTechOrAdmin ? (
            <select 
              value={ticket.status} 
              onChange={(e) => handleStatusChange(e.target.value)}
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
            >
              <option value="ABIERTO">Abierto</option>
              <option value="EN_PROGRESO">En Progreso</option>
              <option value="ESPERANDO_USUARIO">Esperando al Usuario</option>
              <option value="RESUELTO">Marcar como Resuelto</option>
            </select>
          ) : (
            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-bold text-sm">
              {ticket.status}
            </span>
          )}
        </div>
        <div className="mt-4 p-4 bg-gray-50 rounded border text-gray-700 whitespace-pre-wrap">
          {ticket.description}
        </div>
      </div>

      {/* Zona de Chat (Ping-Pong) */}
      <div className="mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2">Historial y Comentarios</h2>
        
        {/* Aquí inyectamos el componente de Chat que hicimos antes */}
        <TicketChat 
          comments={ticket.comments || []} 
          currentUserRole={currentUser.role} 
        />
      </div>

      {/* Zona para escribir respuesta */}
      {ticket.status !== 'CERRADO' && (
        <CommentInput 
          ticketId={ticket.id} 
          currentUser={currentUser} 
          onCommentAdded={fetchTicketDetail} // Le pasamos la función para que recargue el chat al enviar
        />
      )}
    </div>
  );
}