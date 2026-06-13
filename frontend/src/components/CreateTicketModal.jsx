// components/CreateTicketModal.jsx
import { useState } from "react";
import { X, Plus, Trash2 } from 'lucide-react';

const PRIORITY_OPTIONS = [
  { value: "BAJA", label: "Baja", color: "text-green-600" },
  { value: "MEDIA", label: "Media", color: "text-yellow-600" },
  { value: "ALTA", label: "Alta", color: "text-orange-600" },
  { value: "URGENTE", label: "Urgente", color: "text-red-600" },
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
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };
  const handleAddSubtaskField = () =>
    setSubtasks((prev) => [...prev, { title: "", assigneeId: "" }]);
  const handleSubtaskChange = (index, field, value) => {
    setSubtasks((prev) =>
      prev.map((st, i) => (i === index ? { ...st, [field]: value } : st)),
    );
  };
  const handleRemoveSubtaskField = (index) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

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
        priority,
        subtasks: subtasks.filter((st) => st.title.trim() !== ""),
      });
      if (result.success) {
        setTitle("");
        setDescription("");
        setAssigneeIds([]);
        setDueDate("");
        setPriority("MEDIA");
        setSubtasks([]); // ← aquí adentro
        onClose();
      }
    } catch {
      alert("Error al crear el proyecto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">
            Crear Nuevo Proyecto
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 bg-gray-100 hover:bg-gray-200 p-2 rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Título del Proyecto
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Rediseño de la web"
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Descripción
            </label>
            <textarea
              type="text"
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ej: Revisar el diseño actual y proponer mejoras"
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Prioridad
            </label>
            <div className="grid grid-cols-4 gap-2">
              {PRIORITY_OPTIONS.map(({ value, label, color }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPriority(value)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border-2 transition-colors
                    ${
                      priority === value
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : `border-gray-100 bg-gray-50 ${color} hover:border-gray-300`
                    }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 pt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                Checklist / Subtareas
              </label>
              <button
                type="button"
                onClick={handleAddSubtaskField}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Agregar
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.length === 0 ? (
                <p className="text-xs text-gray-400 italic">
                  No hay subtareas. Haz clic en "Agregar".
                </p>
              ) : (
                subtasks.map((st, index) => (
                  <div
                    key={index}
                    className="flex gap-2 items-center bg-gray-50 p-2 rounded-xl"
                  >
                    <input
                      type="text"
                      placeholder="Tarea..."
                      value={st.title}
                      onChange={(e) =>
                        handleSubtaskChange(index, "title", e.target.value)
                      }
                      className="flex-1 bg-white border-none rounded-lg p-2 text-sm focus:ring-1 focus:ring-indigo-500"
                    />
                    <select
                      value={st.assigneeId}
                      onChange={(e) =>
                        handleSubtaskChange(index, "assigneeId", e.target.value)
                      }
                      className="w-32 bg-white border-none rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">Cualquiera</option>
                      {users
                        .filter((u) => assigneeIds.includes(u.id))
                        .map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.name.split(" ")[0]}
                          </option>
                        ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveSubtaskField(index)}
                      className="text-red-400 hover:text-red-600 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Asignar a (Múltiples)
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto bg-gray-50 p-3 rounded-xl">
              {users.map((user) => (
                <label
                  key={user.id}
                  className="flex items-center space-x-3 cursor-pointer p-1 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={assigneeIds.includes(user.id)}
                    onChange={() => handleAssigneeChange(user.id)}
                    className="rounded text-indigo-600 w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {user.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Fecha Límite (Opcional)
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-indigo-600 text-white text-sm font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Creando..." : "Crear Proyecto"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
