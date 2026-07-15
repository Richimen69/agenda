import { useState } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";

export default function CreateProjectModal({
  isOpen,
  onClose,
  users,
  onSubmit,
  places,
}) {
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;
  const handleAssigneeChange = (placeId) => {
    setAssigneeIds((prev) =>
      prev.includes(placeId)
        ? prev.filter((id) => id !== placeId)
        : [...prev, placeId ],
    );
  };
  const handleAddSubtaskField = () =>
    setSubtasks((prev) => [...prev, { title: "", assigneeId: "" }]);
  const handleSubtaskChange = (index, field, value) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, [field]: value } : st)),
    );
  };
  const handleRemoveSubtaskField = (index) =>
    setSubtasks((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assigneeIds.length === 0)
      return alert("Selecciona al menos un responsable.");
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        title,
        description,
        assigneeIds,
        dueDate,
      });
    } catch {
      alert("Error al crear el proyecto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function AssigneeOption({ id, label, isSelected, onToggle }) {
    return (
      <label
        className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
          isSelected ? "bg-brand-subtle/30" : "hover:bg-layout-hover"
        }`}
      >
        <span
          className={`text-sm ${isSelected ? "font-semibold text-content-main" : "text-content-muted"}`}
        >
          {label}
        </span>
        <div
          className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
            isSelected
              ? "bg-brand border-brand text-white"
              : "border-layout-border bg-layout-surface"
          }`}
        >
          {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
        </div>
        <input
          type="checkbox"
          className="hidden"
          checked={isSelected}
          onChange={onToggle}
        />
      </label>
    );
  }

  return (
    // Overlay oscuro y blur
    <div className="fixed inset-0 bg-content-main/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Contenedor del Modal: Restringimos la altura para que scrollee internamente si es muy largo */}
      <div className="bg-layout-surface rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-layout-border">
        {/* Header Fijo */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-layout-border bg-layout-surface">
          <h2 className="text-lg font-semibold text-content-main tracking-tight">
            Crear Nuevo Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted cursor-pointer hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Formulario scrolleable) */}
        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 custom-scrollbar"
        >
          {/* Fila 1: Título */}
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Título del Proyecto <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Rediseño de la intranet corporativa"
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
            />
          </div>

          {/* Fila 2: Descripción */}
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Descripción detallada{" "}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-content-main mb-1.5">
                Fecha Límite
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full cursor-pointer bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
              />
            </div>
          </div>

          {/* Fila 4: Responsables (Lista estilo Enterprise con Avatares) */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-sm font-medium text-content-main">
                Equipo Asignado <span className="text-status-danger">*</span>
              </label>
              <span className="text-xs text-content-muted font-medium">
                {assigneeIds.length} seleccionado(s)
              </span>
            </div>

            <div className="border border-layout-border rounded-md max-h-40 overflow-y-auto divide-y divide-layout-border bg-layout-surface shadow-inner">
              {places.map((depto) => (
                <div key={depto.id}>
                  {depto.hijos.length > 0 ? (
                    <>
                      <div className="px-2.5 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-content-muted">
                        {depto.nombre}
                      </div>
                      {depto.hijos.map((hijo) => (
                        <AssigneeOption
                          key={hijo.id}
                          id={hijo.id}
                          label={hijo.nombre}
                          isSelected={assigneeIds.includes(hijo.id)}
                          onToggle={() => handleAssigneeChange(hijo.id)}
                        />
                      ))}
                    </>
                  ) : (
                    <AssigneeOption
                      id={depto.id}
                      label={depto.nombre}
                      isSelected={assigneeIds.includes(depto.id)}
                      onToggle={() => handleAssigneeChange(depto.id)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </form>

        {/* Footer Fijo con Acciones (Primary / Secondary) */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-layout-border bg-layout-app/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-content-main bg-layout-surface border border-layout-border rounded-md hover:bg-layout-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            form="create-project-form"
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
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Creando...
              </>
            ) : (
              "Crear Tarea"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
