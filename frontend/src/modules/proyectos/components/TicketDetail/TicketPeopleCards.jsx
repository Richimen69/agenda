import { useState } from "react";
import { Bookmark, Users, Edit2, Check } from "lucide-react";
import { updateTicketAssignees } from "../../../../services/api";

function getInitials(name) {
  return name
    ? name.split(" ").map((n) => n[0]).join("").substring(0, 2).toUpperCase()
    : "UN";
}

export default function TicketPeopleCards({
  ticket,
  users,
  activeUserId,
  isCreator,
  onUpdate,
}) {
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [editTeamIds, setEditTeamIds] = useState(ticket.assignees.map((a) => a.id));
  const [isSaving, setIsSaving] = useState(false);

  // Función limpia para agregar/quitar usuarios del arreglo
  const toggleAssignee = (userId) => {
    setEditTeamIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSaveTeam = async () => {
    if (editTeamIds.length === 0) return alert("Debe haber al menos un responsable.");
    setIsSaving(true);
    try {
      const res = await updateTicketAssignees(ticket.id, editTeamIds, activeUserId);
      if (res.success) {
        setIsEditingTeam(false);
        onUpdate(); // Recarga los datos en la pantalla principal
      } else {
        alert(res.error);
      }
    } catch {
      alert("Error al actualizar el equipo.");
    } finally {
      setIsSaving(false);
    }
  };

  const cancelEditing = () => {
    setEditTeamIds(ticket.assignees.map((a) => a.id)); // Restaurar selección original
    setIsEditingTeam(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      
      {/* 1. Tarjeta: Propietario / Creador */}
      <div className="bg-layout-surface rounded-xl p-5 border border-layout-border shadow-sm flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-layout-app border border-layout-border flex items-center justify-center text-content-muted shrink-0 shadow-sm">
          <Bookmark className="w-5 h-5" />
        </div>
        <div className="w-10 h-10 rounded-full bg-status-neutral flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm">
          {getInitials(ticket.creator?.name)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-0.5">
            Propietario
          </p>
          <p className="text-sm font-bold text-content-main truncate">
            {ticket.creator?.name}
          </p>
        </div>
      </div>

      {/* 2. Tarjeta: Equipo Asignado */}
      <div className="bg-layout-surface rounded-xl p-5 border border-layout-border shadow-sm flex items-start gap-4 transition-all">
        
        {!isEditingTeam && (
          <div className="w-10 h-10 rounded-lg bg-layout-app border border-layout-border flex items-center justify-center text-content-muted shrink-0 shadow-sm">
            <Users className="w-5 h-5" />
          </div>
        )}

        {isEditingTeam ? (
          /* MODO EDICIÓN */
          <div className="flex-1 w-full animate-fade-in">
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-xs font-bold text-content-main uppercase tracking-wider">
                Modificar Equipo
              </h4>
              <span className="text-[11px] font-medium text-content-muted">
                {editTeamIds.length} seleccionado(s)
              </span>
            </div>
            
            <div className="bg-layout-app border border-layout-border rounded-lg max-h-40 overflow-y-auto divide-y divide-layout-border mb-4 shadow-inner">
              {users.map((u) => {
                const isSelected = editTeamIds.includes(u.id);
                return (
                  <label
                    key={u.id}
                    className={`flex items-center gap-3 p-2.5 cursor-pointer transition-colors ${
                      isSelected ? "bg-brand-subtle/40" : "hover:bg-layout-hover"
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      className="hidden" 
                      checked={isSelected}
                      onChange={() => toggleAssignee(u.id)} // <-- Usamos la función limpia aquí
                    />
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? "bg-brand border-brand text-white" : "border-layout-border bg-layout-surface"
                    }`}>
                      {isSelected && <Check className="w-3 h-3" strokeWidth={3} />}
                    </div>
                    <span className={`text-sm ${isSelected ? "font-semibold text-content-main" : "text-content-muted"}`}>
                      {u.name} {u.id === activeUserId && "(Tú)"}
                    </span>
                  </label>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={cancelEditing}
                disabled={isSaving}
                className="text-xs font-semibold text-content-main bg-layout-surface border border-layout-border px-3 py-1.5 rounded hover:bg-layout-hover transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveTeam}
                disabled={isSaving}
                className="text-xs font-semibold text-white bg-brand px-4 py-1.5 rounded hover:bg-brand-hover transition-colors disabled:opacity-60 cursor-pointer flex items-center gap-2"
              >
                {isSaving ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        ) : (
          /* MODO VISTA */
          <div className="flex-1 min-w-0 flex justify-between items-center group">
            <div className="min-w-0 pr-4">
              <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1.5">
                Equipo Asignado
              </p>
              
              <div className="flex items-center gap-3">
                <div className="flex -space-x-2 shrink-0">
                  {ticket.assignees.slice(0, 3).map((assignee, index) => (
                    <div
                      key={assignee.id}
                      className="w-8 h-8 rounded-full bg-status-neutral text-white flex items-center justify-center text-[10px] font-bold ring-2 ring-layout-surface shadow-sm"
                      style={{ zIndex: 10 - index }}
                      title={assignee.name}
                    >
                      {getInitials(assignee.name)}
                    </div>
                  ))}
                  {ticket.assignees.length > 3 && (
                    <div className="w-8 h-8 rounded-full bg-layout-border text-content-main flex items-center justify-center text-[10px] font-bold ring-2 ring-layout-surface shadow-sm" style={{ zIndex: 1 }}>
                      +{ticket.assignees.length - 3}
                    </div>
                  )}
                </div>
                
                <p className="text-sm font-semibold text-content-main truncate">
                  {ticket.assignees.map((a) => (a.id === activeUserId ? "Tú" : a.name.split(" ")[0])).join(", ")}
                </p>
              </div>
            </div>

            {isCreator && (
              <button
                onClick={() => setIsEditingTeam(true)}
                className="shrink-0 p-2 text-content-muted hover:text-brand hover:bg-brand-subtle rounded-md transition-all opacity-0 group-hover:opacity-100 focus:opacity-100 outline-none cursor-pointer"
                title="Modificar equipo"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}