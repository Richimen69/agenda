import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import TicketList from '../components/TicketList';
import AgendaCalendar from '../../agenda/components/AgendaCalendar';
import CreateEventForm from '../../agenda/components/CreateEventForm';

export default function WorkspacePage({ tickets, users, events, authUser, fetchData }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Proyectos */}
      <section>
        <TicketList
          tickets={tickets}
          users={users}
          activeUserId={authUser.id}
          onStatusChange={fetchData}
          onTicketSelect={(ticket) => navigate(`/tickets/${ticket.id}`)}
        />
      </section>
    </div>
  );
}
