import React, { useState, useEffect } from "react";
import { X, Check, CircleAlert, Search } from "lucide-react";
import { createEvent } from "@modules/agenda/services/events.api";
import { sileo } from "sileo";

const normalizar = (texto = "") =>
  texto
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const CrearEventModal = ({
  isOpen,
  onClose,
  users = [],
  userId,
  initialDate,
  onCreated,
}) => {
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(initialDate || "");
  const [time, setTime] = useState("12:00");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([userId]);
  const [userSearch, setUserSearch] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Resetea el formulario cada vez que el modal se abre,
  // precargando la fecha del día que se haya clickeado en el calendario
  useEffect(() => {
    if (isOpen) {
      setTitle("");
      setDate(initialDate || "");
      setTime("12:00");
      setDescription("");
      setAssigneeIds([userId]);
      setUserSearch("");
      setIsSubmitting(false);
    }
  }, [isOpen, initialDate, userId]);

  // Cierra con ESC
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleAssigneeChange = (id) => {
    setAssigneeIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!date || !time) {
      alert("Por favor selecciona fecha y hora");
      return; // todavía no se ha puesto isSubmitting en true, así que no se cuelga
    }

    setIsSubmitting(true);
    try {
      const scheduledAt = `${date}T${time}:00-06:00`;
      const result = await createEvent({
        title,
        description,
        scheduledAt,
        creatorId: userId,
        attendeeIds: assigneeIds,
      });

      if (result.success) {
        sileo.success({
          title: "Evento Registrado",
          description: `${title} Registrado correctamente`,
          fill: "#D8F3DC",
          styles: {
            title: "text-black/75!",
            description: "text-black/75!",
            badge: "bg-white!",
          },
        });
        onCreated?.();
        onClose();
      }
    } catch (error) {
      sileo.error({
        title: "Error",
        description: error.message || "Ocurrió un error inesperado",
        fill: "#EB0A1E",
        icon: <CircleAlert className="size-4.5" />,
        styles: {
          title: "text-white!",
          description: "text-white!",
          badge: "bg-white!",
        },
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const usersFiltrados = userSearch.trim()
    ? users.filter((user) => normalizar(user.name).includes(normalizar(userSearch)))
    : users;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-layout-surface rounded-xl shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <form id="create-event-form" onSubmit={handleSubmit}>
          <div className="flex px-6 py-4 justify-between items-center border-b border-layout-border bg-layout-surface">
            <h2 className="text-lg font-semibold text-content-main tracking-tight">
              Crear Nuevo Evento
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="text-content-muted hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md transition-colors cursor-pointer"
              aria-label="Cerrar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="px-6 py-4 space-y-3">
            <div>
              <div className="flex">
                <label className="block text-sm font-medium text-content-main mb-1.5">
                  Titulo
                </label>
                <span className="text-status-danger">*</span>
              </div>
              <input
                type="text"
                value={title}
                required
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Rediseño de la intranet corporativa"
                className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fecha
                </label>
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-brand focus:border-brand transition-shadow focus:ring-1 cursor-text"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Hora
                </label>
                <input
                  type="time"
                  required
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow cursor-text"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-content-main mb-1.5">
                Descripción
                <span className="text-status-danger">*</span>
              </label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Define el alcance y los objetivos del proyecto..."
                className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow resize-none"
              />
            </div>

            <div>
              <div className="flex justify-between items-end mb-1.5">
                <label className="block text-sm font-medium text-content-main">
                  Evento compartido
                  <span className="text-status-danger">*</span>
                </label>
                <span className="text-xs text-content-muted font-medium">
                  {assigneeIds.length} seleccionado(s)
                </span>
              </div>
              {/* Buscador de usuarios */}
              <div className="relative mb-2">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-content-muted" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Buscar por nombre..."
                  className="w-full bg-layout-surface border border-layout-border rounded-md pl-8 pr-3 py-1.5 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
                />
              </div>
              {/* Contenedor con altura máxima para no romper el modal */}
              <div className="border border-layout-border rounded-md max-h-40 overflow-y-auto divide-y divide-layout-border bg-layout-surface shadow-inner scrollbar-thin">
                {usersFiltrados.length === 0 ? (
                  <p className="text-sm text-content-muted text-center py-4">
                    Sin coincidencias para "{userSearch}"
                  </p>
                ) : (
                  usersFiltrados.map((user) => {
                    const isSelected = assigneeIds.includes(user.id);
                    return (
                      <label
                        key={user.id}
                        className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-brand-subtle/30"
                            : "hover:bg-layout-hover"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-sm ${isSelected ? "font-semibold text-content-main" : "text-content-muted"}`}
                          >
                            {userId === user.id ? `${user.name} (Tú)` : user.name}
                          </span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                            isSelected
                              ? "bg-brand border-brand text-white"
                              : "border-layout-border bg-layout-surface"
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3 h-3" strokeWidth={3} />
                          )}
                        </div>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={isSelected}
                          onChange={() => handleAssigneeChange(user.id)}
                        />
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-layout-border rounded-b-xl bg-layout-app/50">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-semibold text-content-main bg-layout-surface border border-layout-border rounded-md hover:bg-layout-hover transition-colors disabled:opacity-50 cursor-pointer"
            >
              Cancelar
            </button>
            <button
              form="create-event-form"
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-md hover:bg-brand-hover focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Creando...
                </>
              ) : (
                "Crear Evento"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrearEventModal;