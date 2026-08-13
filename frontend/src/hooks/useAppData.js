import { useState, useCallback } from "react";
import {
  getUsers,
  getTickets,
  getEvents,
  updateTicketStatus,
  addTicketComment,
  getPlaces,
  getMyProjects,
  getLeads,
} from "@services/api";
import dayjs from "dayjs";

export function useAppData(authUser) {
  const [users, setUsers] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [places, setPlaces] = useState([]);
  const [projects, setProjects] = useState([]);
  const [myProjects, setMyProjects] = useState([]);
  const [leads, setLeads] = useState([]);
  const [leadsMonth, setLeadsMonth] = useState(dayjs().format("YYYY-MM"));

  const fetchLeadsByMonth = useCallback(async (month, searchQuery = "") => {
    try {
      const startDate = dayjs(month).startOf("month").toISOString();
      const endDate = dayjs(month).endOf("month").toISOString();
      const leadsData = await getLeads({
        start: startDate,
        end: endDate,
        q: searchQuery,
      });
      setLeads(leadsData);
      setLeadsMonth(month);
    } catch (err) {
      console.error(err);
    }
  }, []);

  const fetchData = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    try {
      const startDate = dayjs(leadsMonth).startOf("month").toISOString();
      const endDate = dayjs(leadsMonth).endOf("month").toISOString();
      const [
        usersData,
        ticketsData,
        eventsData,
        placesData,
        myProjectsData,
        leadsData,
      ] = await Promise.all([
        getUsers(),
        getTickets(authUser.id),
        getEvents(authUser.id),
        getPlaces(),
        getMyProjects(authUser.id),
        getLeads({ start: startDate, end: endDate }),
      ]);
      setUsers(usersData);
      setMyProjects(myProjectsData);
      setLeads(leadsData);
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
    myProjects,
    leads,
    leadsMonth,
    fetchLeadsByMonth,
  };
}
