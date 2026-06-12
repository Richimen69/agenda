import { useState, useCallback } from 'react';
import { getUsers, getTickets, getEvents, updateTicketStatus, addTicketComment } from '../services/api';

export function useAppData(authUser) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const [usersData, ticketsData, eventsData] = await Promise.all([
        getUsers(),
        getTickets(authUser.id),
        getEvents(authUser.id),
      ]);
      setUsers(usersData);
      if (ticketsData.success) setTickets(ticketsData.data);
      if (eventsData.success) setEvents(eventsData.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  const handleStatusChange = async (ticketId, newStatus) => {
    await updateTicketStatus(ticketId, newStatus, authUser.id);
    fetchData();
  };

  const handleAddComment = async (ticketId, text) => {
    await addTicketComment(ticketId, authUser.id, text);
    fetchData();
  };

  return { users, tickets, events, loading, fetchData, handleStatusChange, handleAddComment };
}