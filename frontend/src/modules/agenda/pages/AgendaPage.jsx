import { useNavigate } from "react-router-dom";
import { useState } from "react";

import AgendaCalendar from "../components/AgendaCalendar";
import EventosList from "../components/EventosList";
import CrearEventModal from "../components/CrearEventModal";

export default function AgendaPage({
  events,
  authUser,
  users,
  onEventsChange,
}) {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  const eventosAMostrar = diaSeleccionado
    ? events.filter((e) => e.scheduledAt.startsWith(diaSeleccionado.dateStr))
    : events;

  return (
    <div className="space-y-12 animate-fade-in">
      <section>
        <header className="mb-6 flex justify-between">
          <h2 className="text-2xl font-bold text-gray-800">
            Agenda y Notificaciones
          </h2>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            Nuevo evento
          </button>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">
            <AgendaCalendar
              events={events}
              selectedDate={diaSeleccionado?.dateStr}
              onSelectDay={setDiaSeleccionado}
              userId={authUser.id}
            />
          </div>
          <div className="lg:col-span-1 space-y-6 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:sticky lg:top-8 scrollbar-thin">
            <EventosList
              events={eventosAMostrar}
              userId={authUser.id}
              onUpdated={onEventsChange}
            />
          </div>
        </div>
      </section>

      <CrearEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        userId={authUser.id}
        initialDate={diaSeleccionado?.dateStr}
        onCreated={onEventsChange}
      />
    </div>
  );
}
