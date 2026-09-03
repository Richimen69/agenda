// src/support/pages/SupportDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupportTickets, createSupportTicket } from '../services/supportService';

export default function SupportDashboard() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // NUEVO: Estados para manejar los archivos y el botón de carga
  const [files, setFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const currentUser = JSON.parse(localStorage.getItem('authUser')) || { id: '1', role: 'USER', name: 'Juan' };

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await getSupportTickets(currentUser.id, currentUser.role);
      setTickets(data.data || data);
    } catch (error) {
      console.error("Error cargando tickets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // ==========================================
  // LÓGICA DE ARCHIVOS Y CTRL+V
  // ==========================================
  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    e.target.value = null; // Resetea el input
  };

  const handlePaste = (e) => {
    const clipboardItems = e.clipboardData.items;
    const pastedFiles = [];

    for (let i = 0; i < clipboardItems.length; i++) {
      const item = clipboardItems[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        const customFile = new File([file], `captura-${Date.now()}.png`, { type: file.type });
        pastedFiles.push(customFile);
      }
    }

    if (pastedFiles.length > 0) {
      e.preventDefault(); 
      setFiles((prev) => [...prev, ...pastedFiles]);
    }
  };

  const removeFile = (indexToRemove) => {
    setFiles((prev) => prev.filter((_, index) => index !== indexToRemove));
  };

  // ==========================================
  // CREAR TICKET
  // ==========================================
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.target);
    const ticketData = {
      title: formData.get('title'),
      description: formData.get('description'),
      creatorId: currentUser.id,
    };

    try {
      // Le pasamos nuestro estado 'files' a tu servicio
      await createSupportTicket(ticketData, files);
      
      // Limpiamos todo
      setShowCreateForm(false);
      setFiles([]);
      e.target.reset();
      fetchTickets(); 
    } catch (error) {
      alert("Error al crear el ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Módulo de Soporte TI</h1>
        <button 
          onClick={() => {
            setShowCreateForm(!showCreateForm);
            setFiles([]); // Limpiamos archivos si cancela
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
        >
          {showCreateForm ? 'Cancelar' : '+ Nuevo Ticket'}
        </button>
      </div>

      {/* Formulario de Creación */}
      {showCreateForm && (
        <form onSubmit={handleCreateTicket} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Describa su problema</h2>
          
          <div className="mb-4">
            <input 
              name="title" 
              required 
              placeholder="Asunto (Ej. Mi computadora no enciende)" 
              className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
            />
          </div>
          
          {/* TEXTAREA CON ONPASTE */}
          <textarea 
            name="description" 
            required 
            placeholder="Detalles del problema... (Puedes pegar una imagen con Ctrl+V)" 
            className="w-full p-2 border rounded mb-2 focus:ring-2 focus:ring-blue-500 outline-none" 
            rows="3"
            onPaste={handlePaste}
          ></textarea>

          {/* PREVIEW DE ARCHIVOS */}
          {files.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {files.map((file, index) => (
                <div key={index} className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                  <span className="truncate max-w-[150px]">{file.name}</span>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)}
                    className="ml-1 text-blue-400 hover:text-red-500 font-bold focus:outline-none"
                    title="Eliminar archivo"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex justify-between items-center mt-2">
            {/* Botón de adjuntar estilizado */}
            <label className="cursor-pointer text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm font-medium transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              Adjuntar Archivos
              <input 
                type="file" 
                multiple 
                className="hidden" 
                onChange={handleFileChange}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>

            <button 
              type="submit" 
              disabled={isSubmitting}
              className={`px-6 py-2 rounded-lg font-bold text-white transition shadow-sm ${
                isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isSubmitting ? 'Enviando...' : 'Enviar Ticket'}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Tickets (Tabla) */}
      {loading ? (
        <p className="text-center text-gray-500">Cargando tickets...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Folio</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asunto</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {tickets.map(ticket => (
                <tr key={ticket.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">#{ticket.folio}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ticket.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${ticket.status === 'ABIERTO' ? 'bg-red-100 text-red-800' : 
                        ticket.status === 'RESUELTO' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {ticket.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(ticket.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      onClick={() => navigate(`/support/ticket/${ticket.id}`)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Ver Detalle
                    </button>
                  </td>
                </tr>
              ))}
              {tickets.length === 0 && (
                <tr><td colSpan="5" className="px-6 py-4 text-center text-gray-500">No hay tickets registrados.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}