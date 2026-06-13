import { Calendar, Clock, Users } from 'lucide-react';

export default function AgendaList({ events }) {
  return (
    <section className="bg-white rounded-lg shadow-md p-6 mt-8 border-t-4 border-green-500">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Mi Agenda (Próximos Eventos)</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {events.length === 0 ? (
          <p className="text-gray-500 col-span-2 py-4">No tienes eventos programados.</p>
        ) : (
          events.map(event => {
            const eventDate = new Date(event.scheduledAt);
            return (
              <div key={event.id} className="border border-gray-100 bg-gray-50 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <h3 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h3>
                
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-600" />
                    <span>{eventDate.toLocaleDateString('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-green-600" />
                    <span>{eventDate.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>

                  <div className="flex items-start gap-2 pt-2 border-t border-gray-200 mt-2">
                    <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                    <span className="text-xs">
                      Invitados: <strong className="text-gray-700">{event.attendees.map(a => a.name).join(', ')}</strong>
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}