import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function AgendaCalendar({ events }) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Lógica para obtener los días del mes
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  // Generar la cuadrícula del calendario
  const days = [];
  // Espacios vacíos del mes anterior
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `empty-${i}` });
  }
  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(year, month, i).toISOString().split('T')[0];
    // Filtrar eventos que caen en este día
    const dayEvents = events.filter(e => e.scheduledAt.startsWith(dateStr));
    days.push({ empty: false, day: i, dateStr, events: dayEvents, key: `day-${i}` });
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isToday = (d) => {
    const today = new Date();
    return d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      
      {/* HEADER DEL CALENDARIO */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{monthNames[month]} {year}</h2>
            <p className="text-xs text-gray-400 font-medium">Calendario Mensual Interactivo</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button onClick={prevMonth} className="px-3 py-2 hover:bg-gray-50 border-r border-gray-200 transition-colors">
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button onClick={nextMonth} className="px-3 py-2 hover:bg-gray-50 transition-colors">
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button onClick={goToday} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Hoy
          </button>
        </div>
      </div>

      {/* CUADRÍCULA DEL CALENDARIO */}
      <div className="flex-1 flex flex-col">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map(day => (
            <div key={day} className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
              {day}
            </div>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 flex-1 auto-rows-fr">
          {days.map((item, index) => (
            <div 
              key={item.key} 
              className={`min-h-[120px] p-2 border-b border-r border-gray-100 ${index % 7 === 6 ? 'border-r-0' : ''} hover:bg-gray-50 transition-colors`}
            >
              {!item.empty && (
                <div className="h-full flex flex-col">
                  <div className="flex justify-start mb-1">
                    <span className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full ${isToday(item.day) ? 'bg-indigo-600 text-white' : 'text-gray-700'}`}>
                      {item.day}
                    </span>
                  </div>
                  
                  {/* Renderizar Eventos del día */}
                  <div className="flex-1 overflow-y-auto space-y-1 pr-1">
                    {item.events.map(ev => {
                      const time = new Date(ev.scheduledAt).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
                      return (
                        <div key={ev.id} className="bg-green-50 border border-green-100 text-green-700 text-[10px] font-semibold px-2 py-1.5 rounded-md truncate cursor-pointer hover:bg-green-100 transition-colors" title={ev.title}>
                          {time} - {ev.title}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}