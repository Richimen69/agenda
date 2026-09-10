import React, { useState, useEffect } from 'react';
import { getSupportTickets, getSupportCategories } from '../services/supportService';
import TicketList from '../components/TicketList';
import CreateTicketForm from '../components/CreateTicketForm';

export default function SupportDashboard({users}) {
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const currentUser = JSON.parse(localStorage.getItem('authUser')) || { id: '1', name: 'Juan Pérez', role: 'USER' };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [ticketsRes, categoriesRes] = await Promise.all([
        getSupportTickets(currentUser.id, currentUser.role),
        getSupportCategories()
      ]);
      console.log("Tickets fetched:", ticketsRes);
      setTickets(ticketsRes.data || ticketsRes);
      setCategories(categoriesRes.data || categoriesRes);
    } catch (error) {
      console.error("Error cargando datos:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTicketCreated = () => {
    setShowCreateForm(false);
    fetchData(); // Recargamos la tabla para mostrar el nuevo ticket
  };

  return (
    <div className="min-h-screen  p-6 font-sans text-gray-700">
      {showCreateForm ? (
        <CreateTicketForm 
          categories={categories} 
          currentUser={currentUser}
          onCancel={() => setShowCreateForm(false)}
          onSuccess={handleTicketCreated}
          users={users}
        />
      ) : (
        <TicketList 
          tickets={tickets} 
          loading={loading} 
          onNewTicket={() => setShowCreateForm(true)} 
        />
      )}
    </div>
  );
}