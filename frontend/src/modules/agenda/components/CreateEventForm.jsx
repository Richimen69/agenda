import { useState } from "react";
import { createTicket } from "@modules/proyectos/services/tickets.api";

export default function CreateTicketForm({
  users,
  activeUserId,
  onTicketCreated,
}) {
  const [title, setTitle] = useState("");
  const [assigneeIds, setAssigneeIds] = useState([]);
  const [dueDate, setDueDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAssigneeChange = (userId) => {
    setAssigneeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (assigneeIds.length === 0)
      return alert("Selecciona al menos un responsable.");
    setIsSubmitting(true);
    try {
      const result = await createTicket({
        title,
        creatorId: activeUserId,
        assigneeIds,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      if (result.success) {
        setTitle("");
        setAssigneeIds([]);
        setDueDate("");
        onTicketCreated();
      }
    } catch (error) {
      alert("Error al crear el proyecto.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="bg-white rounded-lg shadow-md p-6 border-t-4 border-brand">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">
        Crear Nuevo Proyecto
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Titulo del Proyecto
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Descripción
          </label>
          <textarea
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-2">
            Asignar a
          </label>
          <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 p-2 rounded-md">
            {users.map((user) => (
              <label
                key={user.id}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={assigneeIds.includes(user.id)}
                  onChange={() => handleAssigneeChange(user.id)}
                  className="rounded text-indigo-600"
                />
                <span className="text-xs text-gray-700">{user.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Fecha Limite (Opcional)
          </label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-indigo-600 text-white text-sm font-semibold rounded-md hover:bg-indigo-700"
        >
          {isSubmitting ? "Creando..." : "Crear Proyecto"}
        </button>
      </form>
    </section>
  );
}
