import { useNavigate } from 'react-router-dom';
import AgendaCalendar from '../components/AgendaCalendar';

export default function AgendaPage({ events, authUser }) {
  const navigate = useNavigate();

  return (
    <div className="space-y-12 animate-fade-in">

      <section className="pt-8 border-t border-gray-200">
        <header className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Agenda y Notificaciones</h2>
          <p className="text-gray-500 text-sm">Programa reuniones y el sistema enviará recordatorios automáticos por WhatsApp.</p>
        </header>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-[700px]">
            <AgendaCalendar events={events} />
          </div>
          <div className="lg:col-span-1 space-y-6">
          </div>
        </div>
      </section>
    </div>
  );
}
