import { useState, useMemo } from "react";
import {
  X,
  Target,
  Calendar,
  Check,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import { createAction, createKpi } from "../services/projects.api";

export default function CreateActionModal({
  isOpen,
  onClose,
  projectId,
  members = [], // Recibimos el equipo asignado al proyecto
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ESTADO: Tarea
  const [title, setTitle] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // ESTADO: KPI
  const [kpiName, setKpiName] = useState("");
  const [kpiType, setKpiType] = useState("ACCUMULABLE");
  const [kpiTarget, setKpiTarget] = useState(100);
  const [kpiUnit, setKpiUnit] = useState("uds");

  // ESTADO: Asignación Múltiple (UX Acordeón)
  const [selectedOwners, setSelectedOwners] = useState([]);
  const [expandedAreas, setExpandedAreas] = useState([]);

  // ==========================================
  // LÓGICA DE AGRUPACIÓN (Cerebro UI)
  // Agrupamos el arreglo plano de miembros por Área
  // ==========================================
  const groupedMembers = useMemo(() => {
    const groups = {};
    members.forEach((member) => {
      const areaId = member.area.id;
      if (!groups[areaId]) {
        groups[areaId] = {
          id: areaId,
          name: member.area.name,
          users: [],
        };
      }
      groups[areaId].users.push(member);
    });
    return Object.values(groups);
  }, [members]);

  // Funciones de control UI
  const toggleAreaCollapse = (areaId) => {
    setExpandedAreas((prev) =>
      prev.includes(areaId)
        ? prev.filter((id) => id !== areaId)
        : [...prev, areaId],
    );
  };

  const toggleUser = (userId) => {
    setSelectedOwners((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleAreaGroup = (usersInArea) => {
    const userIds = usersInArea.map((m) => m.user.id);
    const isAllSelected = userIds.every((id) => selectedOwners.includes(id));

    if (isAllSelected) {
      setSelectedOwners((prev) => prev.filter((id) => !userIds.includes(id))); // Deselecciona todos
    } else {
      setSelectedOwners((prev) => Array.from(new Set([...prev, ...userIds]))); // Selecciona todos
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedOwners.length === 0)
      return alert("Por favor asigna al menos un responsable a la tarea.");

    setIsSubmitting(true);
    try {
      // ESCENARIO A: 1 Solo Responsable (Tarea Normal)
      if (selectedOwners.length === 1) {
        const userId = selectedOwners[0];

        const resAction = await createAction(projectId, {
          title,
          weight: 1.0,
          startDate,
          endDate,
          ownerId: userId,
          parentId: null,
        });

        await createKpi(resAction.id, {
          name: kpiName,
          type: kpiType,
          target: parseFloat(kpiTarget),
          unit: kpiUnit,
        });
      }

      else {
        const parentRes = await createAction(projectId, {
          title,
          weight: 1.0,
          startDate,
          endDate,
          ownerId: null,
          parentId: null,
        });

        const parentId = parentRes.id;

        const individualTarget = parseFloat(kpiTarget) / selectedOwners.length;

        for (const userId of selectedOwners) {
          const memberData = members.find((m) => m.user.id === userId);
          const userName = memberData?.user.name.split(" ")[0] || "Asesor";

          const subtaskRes = await createAction(projectId, {
            title: `${title} - ${userName}`,
            weight: 1.0,
            startDate,
            endDate,
            ownerId: userId,
            parentId: parentId,
          });

          await createKpi(subtaskRes.id, {
            name: kpiName,
            type: kpiType,
            target: individualTarget,
            unit: kpiUnit,
          });
        }
      }
      setTitle("");
      setStartDate("");
      setEndDate("");
      setKpiName("");
      setKpiTarget(100);
      setKpiUnit("uds");
      setSelectedOwners([]);

      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      alert("Error al crear la tarea y su métrica.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh] overflow-hidden border border-layout-border">
        <div className="flex justify-between items-center px-6 py-4 border-b border-layout-border bg-slate-50">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-slate-800 tracking-tight">
              Nueva Tarea y KPI
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-content-muted hover:text-slate-800 p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="create-action-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto custom-scrollbar space-y-8"
        >
          {/* SECCIÓN 1: DATOS DE LA TAREA */}
          <section className="space-y-4">
            <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider border-b pb-2">
              1. Detalles de la Tarea
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nombre de la Tarea / Objetivo
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej. Prospectar Base de Datos"
                className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Fecha Inicio
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-1">
                  <Calendar className="w-4 h-4" /> Fecha Límite
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                />
              </div>
            </div>

            {/* LA NUEVA SECCIÓN DE ASIGNACIÓN (ACORDEÓN) */}
            <div>
              <div className="flex justify-between items-end mb-1.5 mt-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Responsables de Ejecución
                </label>
                <span className="text-xs text-content-muted font-medium">
                  {selectedOwners.length} asignado(s)
                </span>
              </div>

              <div className="border border-layout-border rounded-md max-h-48 overflow-y-auto bg-slate-50 shadow-inner custom-scrollbar">
                {groupedMembers.map((area) => {
                  const isExpanded = expandedAreas.includes(area.id);
                  const isAllSelected = area.users.every((m) =>
                    selectedOwners.includes(m.user.id),
                  );

                  return (
                    <div
                      key={area.id}
                      className="border-b border-layout-border last:border-none"
                    >
                      {/* Cabecera del Área */}
                      <div className="flex items-center justify-between px-3 py-2 hover:bg-slate-100 transition-colors">
                        <button
                          type="button"
                          onClick={() => toggleAreaCollapse(area.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-content-muted" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-content-muted" />
                          )}
                          <span className="text-sm font-bold text-slate-700">
                            {area.name}
                          </span>
                        </button>

                        {/* Checkbox para seleccionar a toda el Área */}
                        <label className="flex items-center gap-2 cursor-pointer pl-3 border-l border-layout-border">
                          <span className="text-xs font-semibold text-content-muted">
                            TODOS
                          </span>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={isAllSelected}
                            onChange={() => toggleAreaGroup(area.users)}
                          />
                          <div
                            className={`w-4 h-4 rounded border flex items-center justify-center ${isAllSelected ? "bg-brand border-brand text-white" : "border-slate-300 bg-white"}`}
                          >
                            {isAllSelected && (
                              <Check className="w-3 h-3" strokeWidth={3} />
                            )}
                          </div>
                        </label>
                      </div>

                      {/* Lista de Usuarios dentro del Área */}
                      {isExpanded && (
                        <div className="bg-white py-1">
                          {area.users.map((member) => {
                            const isSelected = selectedOwners.includes(
                              member.user.id,
                            );
                            return (
                              <label
                                key={member.user.id}
                                className={`flex items-center justify-between px-8 py-2 cursor-pointer transition-colors ${isSelected ? "bg-brand-subtle/20" : "hover:bg-slate-50"}`}
                              >
                                <div>
                                  <span
                                    className={`text-sm block ${isSelected ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}
                                  >
                                    {member.user.name}
                                  </span>
                                  <span className="text-[10px] text-content-muted uppercase tracking-wide">
                                    {member.businessRole}{" "}
                                    {member.roleType === "OWNER" && "⭐"}
                                  </span>
                                </div>
                                <input
                                  type="checkbox"
                                  className="hidden"
                                  checked={isSelected}
                                  onChange={() => toggleUser(member.user.id)}
                                />
                                <div
                                  className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? "bg-brand border-brand text-white" : "border-slate-300 bg-white"}`}
                                >
                                  {isSelected && (
                                    <Check
                                      className="w-3 h-3"
                                      strokeWidth={3}
                                    />
                                  )}
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
                {groupedMembers.length === 0 && (
                  <div className="p-4 text-center text-sm text-content-muted">
                    No hay equipo asignado a este proyecto.
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* SECCIÓN 2: KPI (CÓMO SE MIDE) */}
          <section className="space-y-4 bg-slate-50 p-4 rounded-lg border border-layout-border">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              2. Regla de Medición (KPI)
            </h3>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                ¿Qué vamos a medir?
              </label>
              <input
                type="text"
                required
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                placeholder="Ej. Prospectos contactados"
                className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Comportamiento
                </label>
                <select
                  value={kpiType}
                  onChange={(e) => setKpiType(e.target.value)}
                  className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm font-medium outline-none"
                >
                  <option value="ACCUMULABLE">Suma acumulable (+)</option>
                  <option value="STATUS">Porcentaje / Estado</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Meta Numérica {selectedOwners.length > 1 && "(Global)"}
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  value={kpiTarget}
                  onChange={(e) => setKpiTarget(e.target.value)}
                  className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Unidad
                </label>
                <input
                  type="text"
                  required
                  value={kpiUnit}
                  onChange={(e) => setKpiUnit(e.target.value)}
                  placeholder="Ej. uds, MXN, %"
                  className="w-full bg-white border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-brand outline-none"
                />
              </div>
            </div>

            <p className="text-xs text-slate-500 mt-2 italic flex items-center gap-1">
              💡{" "}
              {selectedOwners.length > 1
                ? `Al seleccionar ${selectedOwners.length} responsables, la meta de ${kpiTarget || 0} se dividirá automáticamente entre ellos.`
                : `El sistema medirá el avance hasta alcanzar ${kpiTarget || 0} ${kpiUnit}.`}
            </p>
          </section>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-layout-border bg-white">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-layout-border rounded-md hover:bg-slate-50"
          >
            Cancelar
          </button>
          <button
            form="create-action-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-md hover:opacity-90"
          >
            {isSubmitting ? "Guardando..." : "Crear Tarea y KPI"}
          </button>
        </div>
      </div>
    </div>
  );
}
