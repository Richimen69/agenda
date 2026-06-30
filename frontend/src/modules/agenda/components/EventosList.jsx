import { Users, Trash2, Calendar, Clock, CircleAlert } from "lucide-react";
import { useState } from "react";
import EditEventModal from "./EditEventModal";
import { deleteEvent } from "@services/events.api";
import { sileo } from "sileo";
import DeleteConfirmModal from "../../proyectos/components/DeleteConfirmModal";
export default function EventosList({ events, userId, onUpdated }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [data, setData] = useState(false);
  const [deleteModal, setIsDeleteModal] = useState(false);

  const handleDeleteEvent = async () => {
    try {
      const result = await deleteEvent(data.id, userId);
      if (result.success) {
        sileo.success({
          title: "Evento Eliminado",
          description: `${data.title} eliminado correctamente`,
          fill: "#D8F3DC",
          styles: {
            title: "text-black/75!",
            description: "text-black/75!",
            badge: "bg-white!",
          },
        });
        onUpdated();
        setIsDeleteModal(false);
      }
    } catch {
      sileo.error({
        title: "Error",
        description: "No eres el creador de este evento",
        fill: "#EB0A1E",
        icon: <CircleAlert className="size-4.5" />,
        styles: {
          title: "text-white!",
          description: "text-white!",
          badge: "bg-white!",
        },
      });
    }
  };

  return (
    <div>
      <p className="text-content-main font-bold text-xl">Proximos Eventos</p>
      <div className="space-y-2 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
          {events.length === 0 ? (
            <p className="text-gray-500 col-span-2 py-4">
              No tienes eventos programados.
            </p>
          ) : (
            events.map((event) => {
              const eventDate = new Date(event.scheduledAt);
              const esCreadorPropio = event.creatorId === userId;

              // Función para obtener las iniciales de los colaboradores
              const getInitials = (name) => {
                if (!name) return "";
                return name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .substring(0, 2);
              };

              return (
                <article
                  key={event.id}
                  onClick={() => {
                    setIsModalOpen(true);
                    setData(event);
                  }}
                  className={`group relative cursor-pointer rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md border border-slate-200 hover:border-slate-300`}
                >
                  {/* Barra de acento lateral */}
                  <span
                    aria-hidden="true"
                    className="absolute left-0 top-4 bottom-4 w-1 rounded-full transition-colors bg-transparent group-hover:bg-primary/50"
                  />

                  {/* Cabecera: Fecha, Hora y Botón Borrar */}
                  <div className="flex items-start justify-between gap-2 pl-2">
                    <div
                      className={`flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium ${esCreadorPropio ? "text-brand" : "text-blue-600"}`}
                    >
                      <span className="inline-flex items-center gap-1.5">
                        <Calendar className="size-4" aria-hidden="true" />
                        {eventDate.toLocaleDateString("es-MX", {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="size-4" aria-hidden="true" />
                        {eventDate.toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Botón de eliminación */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsDeleteModal(true);
                        setData(event);
                      }}
                      aria-label={`Eliminar ${event.title}`}
                      className="flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-destructive hover:text-brand cursor-pointer"
                    >
                      <Trash2 className="size-4" />
                    </button>
                  </div>

                  {/* Cuerpo: Título y Descripción */}
                  <div className="mt-2 pl-2">
                    <h3 className="text-base font-semibold leading-tight text-card-foreground text-balance">
                      {event.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      {event.description}
                    </p>
                  </div>

                  {/* Footer: Colaboradores */}
                  <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3 pl-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="size-4 shrink-0" aria-hidden="true" />
                      <span>Colaboradores</span>
                    </div>
                    <div className="flex items-center -space-x-2-reverse flex-row-reverse justify-end pl-2">
                      {event.attendees?.map((attendee, index) => (
                        <span
                          key={attendee.id || index}
                          title={attendee.name}
                          className="flex size-7 items-center justify-center rounded-full border-2 border-card bg-secondary text-xs font-semibold text-secondary-foreground"
                        >
                          {getInitials(attendee.name)}
                        </span>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>
      </div>
      <DeleteConfirmModal
        isOpen={deleteModal}
        tipo={"Evento"}
        ticketTitle={data.title}
        onClose={() => setIsDeleteModal(false)}
        onConfirm={handleDeleteEvent}
        eventUpdated={onUpdated}
      />
      <EditEventModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        evento={data}
        eventUpdated={onUpdated}
      />
    </div>
  );
}
