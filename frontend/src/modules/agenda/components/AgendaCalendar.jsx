import { useState } from "react";
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const MAX_EVENTOS_VISIBLES = 3;

export default function AgendaCalendar({
  events,
  selectedDate,
  onSelectDay,
  userId,
}) {
  const [currentDate, setCurrentDate] = useState(new Date());

  // Lógica para obtener los días del mes
  const getDaysInMonth = (year, month) =>
    new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];
  const dayNames = ["DOM", "LUN", "MAR", "MIÉ", "JUE", "VIE", "SÁB"];

  // Generar la cuadrícula del calendario
  const days = [];
  // Espacios vacíos del mes anterior
  for (let i = 0; i < firstDay; i++) {
    days.push({ empty: true, key: `empty-${i}` });
  }
  // Días del mes actual
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(year, month, i).toISOString().split("T")[0];
    // Filtrar eventos que caen en este día
    const dayEvents = events.filter((e) => e.scheduledAt.startsWith(dateStr));
    days.push({
      empty: false,
      day: i,
      dateStr,
      events: dayEvents,
      key: `day-${i}`,
    });
  }

  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const isToday = (d) => {
    const today = new Date();
    return (
      d === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const openModal = (item) => {
    onSelectDay?.(item);
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full">
      {/* HEADER DEL CALENDARIO */}
      <div className="flex justify-between items-center p-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand">
            <CalendarIcon className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {monthNames[month]} {year}
            </h2>
            <p className="text-xs text-gray-400 font-medium">
              Calendario Mensual Interactivo
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={prevMonth}
              className="px-3 cursor-pointer py-2 hover:bg-gray-50 border-r border-gray-200 transition-colors"
            >
              <ChevronLeft className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={nextMonth}
              className="px-3 py-2 cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <button
            onClick={goToday}
            className="bg-brand hover:bg-brand-hover text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Hoy
          </button>
        </div>
      </div>

      {/* CUADRÍCULA DEL CALENDARIO */}
      <div className="flex-1 flex flex-col">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-gray-100">
          {dayNames.map((day) => (
            <div
              key={day}
              className="py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Celdas de los días */}
        <div className="grid grid-cols-7 flex-1 auto-rows-[7.5rem]">
          {days.map((item, index) => {
            const isSelected = !item.empty && item.dateStr === selectedDate;
            const eventosVisibles = item.empty
              ? []
              : item.events.slice(0, MAX_EVENTOS_VISIBLES);
            const eventosOcultos = item.empty
              ? 0
              : item.events.length - eventosVisibles.length;

            return (
              <div
                key={item.key}
                onClick={() => !item.empty && openModal(item)}
                className={`h-30 p-2 border-b border-r cursor-pointer border-gray-100 overflow-hidden ${index % 7 === 6 ? "border-r-0" : ""} ${isSelected ? "bg-indigo-50/60" : "hover:bg-gray-50"} transition-colors`}
              >
                {!item.empty && (
                  <div className="h-full flex flex-col">
                    <div className="flex justify-start mb-1 shrink-0">
                      <span
                        className={`w-7 h-7 flex items-center justify-center text-sm font-bold rounded-full ${isToday(item.day) ? "bg-brand text-white" : "text-gray-700"}`}
                      >
                        {item.day}
                      </span>
                    </div>

                    {/* Renderizar Eventos del día (con tope fijo) */}
                    <div className="flex-1 min-h-0 space-y-1 overflow-hidden">
                      {eventosVisibles.map((ev) => {
                        const time = new Date(
                          ev.scheduledAt,
                        ).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        });
                        const esCreadorPropio = ev.creatorId === userId;
                        return (
                          <div
                            key={ev.id}
                            className={`text-[10px] font-semibold px-2 py-1.5 rounded-md truncate cursor-pointer transition-colors ${
                              esCreadorPropio
                                ? "bg-brand text-white hover:bg-brand-hover"
                                : "bg-[#1D4ED8] text-white hover:bg-[#1D4ED880]"
                            }`}
                            title={ev.title}
                          >
                            {time} - {ev.title}
                          </div>
                        );
                      })}
                      {eventosOcultos > 0 && (
                        <div className="text-[10px] font-semibold text-gray-400 px-2 hover:text-gray-600 transition-colors">
                          +{eventosOcultos} más
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
