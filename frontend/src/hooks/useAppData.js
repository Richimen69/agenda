import { useState, useCallback } from "react";
import {
  getUsers,
  getTickets,
  getEvents,
  updateTicketStatus,
  addTicketComment,
  getPlaces,
  getMyProjects
} from "@services/api";

export function useAppData(authUser) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const [usersData, ticketsData, eventsData, placesData, myProjectsData] =
        await Promise.all([
          getUsers(),
          getTickets(authUser.id),
          getEvents(authUser.id),
          getPlaces(),
          getMyProjects(authUser.id)
        ]);
      setUsers(usersData);
      setMyProjects(myProjectsData)
      if (ticketsData.success) setTickets(ticketsData.data);
      if (eventsData.success) setEvents(eventsData.data);
      if (placesData.success) setPlaces(placesData.data);
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

  return {
    users,
    tickets,
    events,
    places,
    loading,
    fetchData,
    handleStatusChange,
    handleAddComment,
    myProjects
  };
}
