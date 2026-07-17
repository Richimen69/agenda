import { useState } from "react";
import { X, Check, Star, ChevronDown, ChevronRight, Users } from "lucide-react";

export default function CreateProjectModal({
  isOpen,
  onClose,
  onSubmit,
  places,
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");

  // 👉 EL CEREBRO DEL MODAL
  const [selectedUsers, setSelectedUsers] = useState([]); // Guarda IDs de humanos
  const [ownerId, setOwnerId] = useState(null); // Guarda el ID del líder
  const [expandedAreas, setExpandedAreas] = useState([]); // Controla el acordeón

  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // --- LÓGICA DE UI ---

  const toggleArea = (areaId) => {
    setExpandedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId],
    );
  };

  const toggleUser = (userId) => {
    setSelectedUsers((prev) => {
      const isSelected = prev.includes(userId);
      const next = isSelected
        ? prev.filter((id) => id !== userId)
        : [...prev, userId];

      // Si deseleccionan al líder, apagamos la estrella
      if (isSelected && ownerId === userId) setOwnerId(null);
      return next;
    });
  };

  const toggleRoleGroup = (role) => {
    if (!role.users || role.users.length === 0) return;

    const roleUserIds = role.users.map((u) => u.id);
    const isAllSelected = roleUserIds.every((id) => selectedUsers.includes(id));

    if (isAllSelected) {
      // Quitar a todos
      setSelectedUsers((prev) =>
        prev.filter((id) => !roleUserIds.includes(id)),
      );
      if (roleUserIds.includes(ownerId)) setOwnerId(null);
    } else {
      // Seleccionar a todos
      setSelectedUsers((prev) =>
        Array.from(new Set([...prev, ...roleUserIds])),
      );
    }
  };

  const handleSetOwner = (userId, e) => {
    e.stopPropagation(); // Evita que se dispare el checkbox al darle a la estrella
    if (!selectedUsers.includes(userId)) {
      setSelectedUsers((prev) => [...prev, userId]); // Lo selecciona automáticamente
    }
    setOwnerId(ownerId === userId ? null : userId);
  };

  // --- LÓGICA DE ENVÍO AL BACKEND ---

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUsers.length === 0)
      return alert("Selecciona al menos un responsable.");
    if (!ownerId)
      return alert(
        "Debes asignar un Líder (haz clic en la estrella amarilla).",
      );

    setIsSubmitting(true);

    try {
      const membersPayload = [];

      // Mapeamos el JSON para armar el payload exacto
      places.forEach((area) => {
        area.children?.forEach((role) => {
          role.users?.forEach((user) => {
            if (selectedUsers.includes(user.id)) {
              membersPayload.push({
                userId: user.id,
                areaId: area.id,
                roleType: user.id === ownerId ? "OWNER" : "SUPPORT",
                businessRole: role.name, // Ej: "Gerente de sistemas"
              });
            }
          });
        });
      });

      await onSubmit({
        title,
        description,
        targetDate,
        members: membersPayload,
      });

      // Limpieza
      setTitle("");
      setDescription("");
      setTargetDate("");
      setSelectedUsers([]);
      setOwnerId(null);
      onClose();
    } catch (error) {
      const detalleError = error.response?.data || error.message || error;
      console.error("🔥 DETALLE DEL ERROR:", detalleError);
      alert("Error: Revisa la consola (F12) para ver el detalle.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-content-main/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-layout-surface rounded-xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh] overflow-hidden border border-layout-border">
        {/* Header Fijo */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-layout-border bg-layout-surface">
          <h2 className="text-lg font-semibold text-content-main tracking-tight">
            Crear Proyecto
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-content-main p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario Scrolleable */}
        <form
          id="create-project-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 custom-scrollbar"
        >
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Título del Proyecto *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Implementación de ERP"
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main focus:ring-1 focus:ring-brand focus:border-brand outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Descripción *
            </label>
            <textarea
              required
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main focus:ring-1 focus:ring-brand outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Fecha Meta *
            </label>
            <input
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main focus:ring-1 focus:ring-brand outline-none"
            />
          </div>

          {/* MATRIZ DE PARTICIPANTES (El Árbol) */}
          <div>
            <div className="flex justify-between items-end mb-1.5">
              <label className="block text-sm font-medium text-content-main">
                Equipo Asignado *
              </label>
              <span className="text-xs text-content-muted font-medium">
                {selectedUsers.length} participante(s) |{" "}
                {ownerId ? "1 Líder" : "Sin Líder"}
              </span>
            </div>

            <div className="border border-layout-border rounded-md max-h-56 overflow-y-auto bg-layout-surface shadow-inner custom-scrollbar">
              {places.map((area) => {
                const isExpanded = expandedAreas.includes(area.id);
                // Solo mostrar áreas que tengan puestos con usuarios
                const hasUsers = area.children?.some(
                  (role) => role.users && role.users.length > 0,
                );

                if (!hasUsers) return null; // Ocultamos áreas vacías (Ej. Gerencia)

                return (
                  <div
                    key={area.id}
                    className="border-b border-layout-border last:border-none"
                  >
                    {/* Header del Departamento */}
                    <button
                      type="button"
                      onClick={() => toggleArea(area.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 bg-layout-hover/50 hover:bg-layout-hover text-left transition-colors"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-content-muted" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-content-muted" />
                      )}
                      <span className="text-sm font-semibold text-content-main">
                        {area.name}
                      </span>
                    </button>

                    {/* Contenido Expandido (Puestos y Usuarios) */}
                    {isExpanded && (
                      <div className="bg-layout-surface py-1">
                        {area.children.map((role) => {
                          if (!role.users || role.users.length === 0)
                            return null;

                          const roleUserIds = role.users.map((u) => u.id);
                          const isAllRoleSelected = roleUserIds.every((id) =>
                            selectedUsers.includes(id),
                          );

                          return (
                            <div key={role.id} className="mb-2">
                              {/* Header del Puesto (Permite seleccionar a todos) */}
                              <label className="flex items-center gap-2 px-6 py-1.5 cursor-pointer hover:bg-layout-hover transition-colors">
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isAllRoleSelected}
                                  onChange={() => toggleRoleGroup(role)}
                                />
                                <div
                                  className={`w-3.5 h-3.5 rounded border flex items-center justify-center ${isAllRoleSelected ? "bg-brand border-brand text-white" : "border-layout-border bg-layout-surface"}`}
                                >
                                  {isAllRoleSelected && (
                                    <Check
                                      className="w-2.5 h-2.5"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                                <span className="text-xs font-bold text-content-muted uppercase tracking-wider">
                                  {role.name}
                                </span>
                                <Users className="w-3 h-3 text-content-muted ml-auto" />
                              </label>

                              {/* Los Humanos */}
                              {role.users.map((user) => {
                                const isUserSelected = selectedUsers.includes(
                                  user.id,
                                );
                                const isOwner = ownerId === user.id;

                                return (
                                  <label
                                    key={user.id}
                                    className={`flex items-center gap-3 px-8 py-2 cursor-pointer transition-colors ${isUserSelected ? "bg-brand-subtle/20" : "hover:bg-layout-hover"}`}
                                  >
                                    <input
                                      type="checkbox"
                                      className="hidden"
                                      checked={isUserSelected}
                                      onChange={() => toggleUser(user.id)}
                                    />

                                    <div
                                      className={`w-4 h-4 rounded border flex items-center justify-center ${isUserSelected ? "bg-brand border-brand text-white" : "border-layout-border bg-layout-surface"}`}
                                    >
                                      {isUserSelected && (
                                        <Check
                                          className="w-3 h-3"
                                          strokeWidth={3}
                                        />
                                      )}
                                    </div>

                                    <span
                                      className={`text-sm flex-1 ${isUserSelected ? "font-semibold text-content-main" : "text-content-muted"}`}
                                    >
                                      {user.name}
                                    </span>

                                    {/* LA ESTRELLA DE LÍDER (OWNER) */}
                                    <button
                                      type="button"
                                      onClick={(e) =>
                                        handleSetOwner(user.id, e)
                                      }
                                      className="p-1 rounded hover:bg-layout-border transition-colors group"
                                      title="Marcar como Líder de Proyecto"
                                    >
                                      <Star
                                        className={`w-4 h-4 ${isOwner ? "fill-yellow-400 text-yellow-400" : "text-content-muted/50 group-hover:text-yellow-400"}`}
                                      />
                                    </button>
                                  </label>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-layout-border bg-layout-app/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-content-main bg-layout-surface border border-layout-border rounded-md hover:bg-layout-hover"
          >
            Cancelar
          </button>
          <button
            form="create-project-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-md hover:opacity-90 flex items-center gap-2"
          >
            {isSubmitting ? "Creando..." : "Crear Proyecto"}
          </button>
        </div>
      </div>
    </div>
  );
}
