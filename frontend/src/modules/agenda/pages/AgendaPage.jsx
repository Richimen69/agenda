import { useNavigate } from "react-router-dom";
import AgendaCalendar from "../components/AgendaCalendar";
import EventosList from "../components/EventosList";

export default function AgendaPage({ events, authUser }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-fade-in">
      <section className="pt-8 ">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Agenda y Notificaciones
          </h2>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <AgendaCalendar events={events} />
          </div>
          <div className="lg:col-span-1 space-y-6">
            <EventosList />
          </div>
        </div>
      </section>
    </div>
  );
}
