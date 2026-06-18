import { useState } from "react";
import { CheckSquare, Square, Plus, Trash2, X } from "lucide-react";
import { addSubtask, toggleSubtask, deleteSubtask } from "../../../../services/api";

function getInitials(name) {
  return name
    ? name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "UN";
}

export default function TicketChecklist({
  ticket,
  users,
  activeUserId,
  isCreator,
  onUpdate,
}) {
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [newSubtaskAssignee, setNewSubtaskAssignee] = useState("");

  const handleAddSubtask = async () => {
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await addSubtask(ticket.id, newSubtaskTitle, newSubtaskAssignee);
      if (res.success) {
        setNewSubtaskTitle("");
        setNewSubtaskAssignee("");
        setIsAddingSubtask(false);
        onUpdate();
      }
    } catch {
      alert("Error al agregar subtarea");
    }
  };

  const handleToggleSubtask = async (subtaskId, currentStatus) => {
    try {
      const res = await toggleSubtask(subtaskId, !currentStatus, activeUserId);
      if (res.success) onUpdate();
      else alert(res.error);
    } catch {
      alert("Error al actualizar subtarea");
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    try {
      const res = await deleteSubtask(subtaskId, activeUserId);
      if (res.success) onUpdate();
      else alert(res.error);
    } catch {
      alert("Error al borrar subtarea");
    }
  };

  return (
    <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex justify-between items-center px-5 py-4 border-b border-layout-border bg-layout-app/50">
        <h3 className="text-[14px] font-semibold text-content-main tracking-tight flex items-center gap-2">
          <div className="p-1 bg-white border border-layout-border rounded text-content-muted shadow-sm">
            <CheckSquare className="w-4 h-4" />
          </div>
          Checklist de Tareas
        </h3>
        <button
          onClick={() => setIsAddingSubtask(!isAddingSubtask)}
          className="text-xs font-semibold text-brand hover:text-brand-hover flex items-center gap-1.5 bg-brand-subtle px-2.5 py-1.5 rounded-md transition-colors cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Agregar Tarea
        </button>
      </div>

      {/* Lista */}
      <div className="p-5 space-y-2.5">
        {ticket.subtasks?.length === 0 && !isAddingSubtask && (
          <div className="border border-dashed border-layout-border rounded-lg p-5 text-center bg-layout-app/50">
            <p className="text-sm font-medium text-content-muted">
              El proyecto no tiene subtareas. Añade una para dividir el trabajo.
            </p>
          </div>
        )}

        {ticket.subtasks?.map((st) => {
          const assigneeName = users.find((u) => u.id === st.assigneeId)?.name;
          const isDone = st.isDone;

          return (
            <div
              key={st.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all group ${
                isDone
                  ? "bg-layout-app border-layout-border/50 opacity-75"
                  : "bg-layout-surface border-layout-border hover:border-brand/30 hover:shadow-sm"
              }`}
            >
              <div
                className="flex items-start gap-3 flex-1 cursor-pointer"
                onClick={() => handleToggleSubtask(st.id, isDone)}
              >
                <div className="mt-0.5 shrink-0 transition-colors">
                  {isDone ? (
                    <CheckSquare className="w-5 h-5 text-status-success" />
                  ) : (
                    <Square className="w-5 h-5 text-layout-border group-hover:text-brand transition-colors" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium transition-all truncate ${
                      isDone ? "text-content-disabled line-through" : "text-content-main"
                    }`}
                  >
                    {st.title}
                  </p>
                  {assigneeName && (
                    <div className="flex items-center gap-1.5 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${
                          isDone ? "bg-content-disabled" : "bg-status-neutral"
                        }`}
                      >
                        {getInitials(assigneeName)}
                      </div>
                      <span
                        className={`text-xs font-medium ${
                          isDone ? "text-content-disabled" : "text-content-muted"
                        }`}
                      >
                        {assigneeName}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {isCreator && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteSubtask(st.id);
                  }}
                  className="text-content-muted hover:text-status-danger p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer outline-none rounded-md hover:bg-status-danger/10"
                  title="Eliminar subtarea"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          );
        })}

        {/* Formulario inline nueva subtarea */}
        {isAddingSubtask && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-layout-surface p-3 rounded-xl border border-layout-border shadow-sm mt-4 animate-fade-in ring-1 ring-brand/5">
            <input
              type="text"
              autoFocus
              placeholder="¿Qué se necesita hacer?..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              className="flex-1 w-full bg-layout-app border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={newSubtaskAssignee}
                onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                className="w-full sm:w-32 bg-layout-app border border-layout-border rounded-md px-2 py-2 text-xs text-content-main focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand cursor-pointer"
              >
                <option value="">Responsable...</option>
                {ticket.assignees.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name.split(" ")[0]}
                  </option>
                ))}
              </select>
              <button
                onClick={handleAddSubtask}
                disabled={!newSubtaskTitle.trim()}
                className="bg-brand text-white px-3 py-2 rounded-md text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0 cursor-pointer shadow-sm"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="text-content-muted hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md transition-colors cursor-pointer shrink-0 border border-transparent hover:border-layout-border"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}