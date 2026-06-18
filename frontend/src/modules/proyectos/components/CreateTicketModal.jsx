import { useState } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { getInitials } from "../../../utils/constants"; // Asumo que tienes esto por el componente anterior

const PRIORITY_OPTIONS = [
  { value: "BAJA", label: "Baja", activeColor: "bg-status-neutral text-white" },
  { value: "MEDIA", label: "Media", activeColor: "bg-status-warning text-white" },
  { value: "ALTA", label: "Alta", activeColor: "bg-brand text-white" },
  { value: "URGENTE", label: "Urgente", activeColor: "bg-status-danger text-white ring-2 ring-status-danger/20" },
];

export default function CreateTicketModal({
  isOpen,
  onClose,
  users,
  onSubmit,
}) {
  const [subtasks, setSubtasks] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState("MEDIA");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleAssigneeChange = (userId) => {
    setAssigneeIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };
  const handleAddSubtaskField = () => setSubtasks((prev) => [...prev, { title: "", assigneeId: "" }]);
  const handleSubtaskChange = (index, field, value) => {
    setSubtasks((prev) => prev.map((st, i) => (i === index ? { ...st, [field]: value } : st)));
  };
  const handleRemoveSubtaskField = (index) => setSubtasks((prev) => prev.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assigneeIds.length === 0) return alert("Selecciona al menos un responsable.");
    setIsSubmitting(true);
    try {
      const result = await onSubmit({
        title,
        description,
        assigneeIds,
        dueDate,
        priority,
        subtasks: subtasks.filter((st) => st.title.trim() !== ""),
      });
      if (result.success) {
        setTitle("");
        setDescription("");
        setAssigneeIds([]);
        setDueDate("");
        setPriority("MEDIA");
        setSubtasks([]);
        onClose();
      }
    } catch {
      alert("Error al crear el proyecto.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="text-content-muted hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Formulario scrolleable) */}
        <form id="create-project-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 custom-scrollbar">
          
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
              Descripción detallada <span className="text-status-danger">*</span>
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

          {/* Fila 3: Prioridad (Segmented Control) y Fecha Límite */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-content-main mb-1.5">
                Prioridad
              </label>
              <div className="flex bg-layout-app p-1 rounded-md border border-layout-border">
                {PRIORITY_OPTIONS.map(({ value, label, activeColor }) => {
                  const isActive = priority === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setPriority(value)}
                      className={`cursor-pointer flex-1 py-1.5 text-xs font-semibold rounded transition-all duration-200 ${
                        isActive 
                          ? `${activeColor} shadow-sm` 
                          : "text-content-muted hover:text-content-main hover:bg-layout-hover"
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

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
            {/* Contenedor con altura máxima para no romper el modal */}
            <div className="border border-layout-border rounded-md max-h-40 overflow-y-auto divide-y divide-layout-border bg-layout-surface shadow-inner">
              {users.map((user) => {
                const isSelected = assigneeIds.includes(user.id);
                return (
                  <label
                    key={user.id}
                    className={`flex items-center justify-between p-2.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-brand-subtle/30" : "hover:bg-layout-hover"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {/* Avatar del usuario */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white ${isSelected ? "bg-brand" : "bg-status-neutral"}`}>
                        {getInitials(user.name)}
                      </div>
                      <span className={`text-sm ${isSelected ? "font-semibold text-content-main" : "text-content-muted"}`}>
                        {user.name}
                      </span>
                    </div>
                    {/* Checkbox customizado corporativo */}
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                      isSelected ? "bg-brand border-brand text-white" : "border-layout-border bg-layout-surface"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <input
                      type="checkbox"
                      className="hidden"
                      checked={isSelected}
                      onChange={() => handleAssigneeChange(user.id)}
                    />
                  </label>
                );
              })}
            </div>
          </div>

          {/* Fila 5: Checklist / Subtareas */}
          <div className="pt-2">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-content-main">
                Desglose de Tareas (Opcional)
              </label>
              <button
                type="button"
                onClick={handleAddSubtaskField}
                className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1 bg-brand-subtle px-2 py-1 rounded transition-colors cursor-pointer"
              >
                <Plus className="w-3 h-3" /> Añadir Tarea
              </button>
            </div>
            
            <div className="space-y-2">
              {subtasks.length === 0 ? (
                <div className="border border-dashed border-layout-border rounded-md p-4 text-center">
                  <p className="text-xs text-content-muted">
                    Divide el proyecto en pasos más pequeños.
                  </p>
                </div>
              ) : (
                subtasks.map((st, index) => (
                  <div key={index} className="flex gap-2 items-start animate-fade-in">
                    <input
                      type="text"
                      placeholder="Ej: Diseñar wireframes..."
                      value={st.title}
                      onChange={(e) => handleSubtaskChange(index, "title", e.target.value)}
                      className="flex-1 bg-layout-surface border border-layout-border rounded-md px-3 py-1.5 text-sm text-content-main focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand"
                    />
                    <select
                      value={st.assigneeId}
                      onChange={(e) => handleSubtaskChange(index, "assigneeId", e.target.value)}
                      className="w-32 bg-layout-surface border border-layout-border rounded-md px-2 py-1.5 text-xs text-content-main focus:outline-none focus:ring-1 cursor-pointer focus:ring-brand focus:border-brand"
                    >
                      <option value="">Cualquiera</option>
                      {users.filter((u) => assigneeIds.includes(u.id)).map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name.split(" ")[0]}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtaskField(index)}
                      className="text-content-muted cursor-pointer hover:text-status-danger p-1.5 transition-colors"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
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
          {/* El botón primario usa el id del form para hacer submit desde afuera del mismo si fuera necesario, o por estándar HTML5 */}
          <button
            form="create-project-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-md hover:bg-brand-hover focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creando...
              </>
            ) : (
              "Crear Proyecto"
            )}
          </button>
        </div>

      </div>
    </div>
  );
}