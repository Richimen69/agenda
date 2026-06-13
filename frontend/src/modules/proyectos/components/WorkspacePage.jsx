import { useNavigate } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import TicketList from './TicketList';
import AgendaCalendar from '../../agenda/components/AgendaCalendar';
import CreateEventForm from '../../agenda/components/CreateEventForm';

export default function WorkspacePage({ tickets, users, events, authUser, fetchData }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-fade-in">
      {/* Proyectos */}
      <section>
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Gestión de Proyectos</h2>
          <p className="text-gray-500 text-sm">Crea, asigna y da seguimiento a las tareas del equipo.</p>
        </header>
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
