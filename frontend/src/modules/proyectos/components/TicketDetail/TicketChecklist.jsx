import { useState } from "react";
import {
  CheckSquare,
  Square,
  Plus,
  Trash2,
  X,
  CircleAlert,
  TrendingUp,
  Target,
  DollarSign,
  Flag,
} from "lucide-react";
import {
  addSubtask,
  toggleSubtask,
  deleteSubtask,
  addKpiRecord,
} from "../../../../services/api"; // Ajusta a tu ruta real
import { sileo } from "sileo";

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

// =========================================================
// MINI-COMPONENTE: EL RENDERIZADOR INTELIGENTE DE KPIS
// =========================================================
function KpiReporter({ kpi, kpiValue, setKpiValue, onReport, isReporting }) {
  const isMilestone = kpi.type === "MILESTONE";
  const isFinancial = kpi.type === "FINANCIAL";

  // 1. RENDERIZADO PARA HITOS (MILESTONE - SÍ/NO)
  if (isMilestone) {
    return (
      <button
        disabled={isReporting}
        onClick={() => onReport(1)} // Reportamos 1 para decir "Cumplido"
        className="w-full sm:w-auto bg-slate-800 text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-slate-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
      >
        <Flag className="w-4 h-4" /> Marcar Hito como Completado
      </button>
    );
  }

  // 2. RENDERIZADO PARA FINANZAS, ACUMULABLE Y ESTADO
  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-content-muted">
        {kpi.type === "ACCUMULABLE"
          ? "Suma tu trabajo al acumulado:"
          : kpi.type === "FINANCIAL"
            ? "Reportar gasto / inversión:"
            : "Actualizar estado general:"}
      </span>
      <div className="flex items-center gap-3">
        <div className="relative">
          {isFinancial && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
          )}
          <input
            type="number"
            placeholder={
              kpi.type === "ACCUMULABLE"
                ? "+ Cantidad a sumar..."
                : "Ingresar valor..."
            }
            value={kpiValue}
            onChange={(e) => setKpiValue(e.target.value)}
            className={`w-48 bg-white border border-layout-border rounded-md py-2 text-sm focus:ring-1 focus:ring-brand outline-none ${isFinancial ? "pl-9 pr-3" : "px-3"}`}
          />
        </div>
        <button
          disabled={isReporting || !kpiValue}
          onClick={() => onReport(kpiValue)}
          className="bg-brand text-white px-4 py-2 rounded-md text-sm font-semibold hover:bg-brand-hover transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          <TrendingUp className="w-4 h-4" />
          {kpi.type === "ACCUMULABLE" ? "Sumar" : "Reportar"}
        </button>
      </div>
    </div>
  );
}

// =========================================================
// COMPONENTE PRINCIPAL
// =========================================================
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

  const [kpiValues, setKpiValues] = useState({});
  const [isReporting, setIsReporting] = useState(false);
  const [globalKpiValue, setGlobalKpiValue] = useState("");

  const isProjectTicket = !!ticket.projectActionId;
  const globalAction = ticket.projectAction;
  const globalKpi =
    globalAction?.kpis?.length > 0 ? globalAction.kpis[0] : null;

  const isGlobalFinancial = globalKpi?.type === "FINANCIAL";

  // Si es financiero, NUNCA se cierra automáticamente (false). Si es operativo, se cierra al llegar al target.
  const isGlobalDone = globalKpi
    ? isGlobalFinancial
      ? false
      : globalKpi.currentValue >= globalKpi.target
    : false;

  // Detectamos si hay sobregiro
  const isGlobalOverBudget =
    isGlobalFinancial && globalKpi.currentValue > globalKpi.target;
  // Lógica operativa (Subtareas normales)
  const handleAddSubtask = async () => {
    /* ... (igual que antes) ... */
    if (!newSubtaskTitle.trim()) return;
    try {
      const res = await addSubtask(
        ticket.id,
        newSubtaskTitle,
        newSubtaskAssignee,
      );
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
    /* ... igual ... */
    try {
      const res = await toggleSubtask(subtaskId, !currentStatus, activeUserId);
      if (res.success) onUpdate();
      else alert(res.error);
    } catch {
      sileo.error({
        title: "Error",
        description: "No puedes completar esta tarea" /*...*/,
      });
    }
  };

  const handleDeleteSubtask = async (subtaskId) => {
    /* ... igual ... */
    try {
      const res = await deleteSubtask(subtaskId, activeUserId);
      if (res.success) onUpdate();
      else alert(res.error);
    } catch {
      alert("Error al borrar subtarea");
    }
  };

  // Lógica de Reporte Estratégico (KPIs)
  const handleReportKpi = async (kpiId, numericValue, isGlobal = false) => {
    if (
      numericValue === undefined ||
      numericValue === null ||
      isNaN(numericValue)
    )
      return;
    setIsReporting(true);
    try {
      await addKpiRecord(kpiId, {
        value: parseFloat(numericValue),
        note: "Reportado desde Ticket Operativo",
        userId: activeUserId,
      });

      if (isGlobal) setGlobalKpiValue("");
      else setKpiValues({});

      onUpdate();
    } catch (error) {
      alert("Error al reportar el avance.");
    } finally {
      setIsReporting(false);
    }
  };

  return (
    <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
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

      {/* 🌟 META COMPARTIDA (GLOBAL) */}
      {globalKpi && (
        <div
          className={`${isGlobalOverBudget ? "bg-red-50/50" : "bg-brand-subtle/30"} p-5 border-b border-layout-border`}
        >
          <div className="flex items-center justify-between mb-3">
            <h4
              className={`text-sm font-bold uppercase tracking-wide flex items-center gap-2 ${isGlobalOverBudget ? "text-status-danger" : "text-brand"}`}
            >
              <Target className="w-4 h-4" />{" "}
              {isGlobalFinancial ? "Presupuesto del Equipo" : "Meta del Equipo"}
            </h4>
            <span
              className={`text-sm font-black ${isGlobalOverBudget ? "text-status-danger" : "text-slate-800"}`}
            >
              {isGlobalFinancial ? "$" : ""}
              {globalKpi.currentValue.toLocaleString()} /{" "}
              {isGlobalFinancial ? "$" : ""}
              {globalKpi.target.toLocaleString()} {globalKpi.unit}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-4">
            <div
              className={`h-full transition-all duration-700 ${
                isGlobalOverBudget
                  ? "bg-status-danger"
                  : isGlobalDone
                    ? "bg-status-success"
                    : "bg-brand"
              }`}
              style={{
                width: `${Math.min(100, (globalKpi.currentValue / globalKpi.target) * 100)}%`,
              }}
            ></div>
          </div>

          {/* El Input siempre aparece para Finanzas, o si la meta operativa no se ha cumplido */}
          {!isGlobalDone && (
            <KpiReporter
              kpi={globalKpi}
              kpiValue={globalKpiValue}
              setKpiValue={setGlobalKpiValue}
              isReporting={isReporting}
              onReport={(val) => handleReportKpi(globalKpi.id, val, true)}
            />
          )}

          {/* Mensaje de Éxito Operativo */}
          {isGlobalDone && !isGlobalFinancial && (
            <p className="text-sm font-bold text-status-success flex items-center gap-1 mt-2">
              <CheckSquare className="w-4 h-4" /> ¡El equipo ha cumplido la meta
              global!
            </p>
          )}

          {/* Mensaje de Alerta Financiera */}
          {isGlobalOverBudget && (
            <p className="text-sm font-bold text-status-danger flex items-center gap-1 mt-2">
              <CircleAlert className="w-4 h-4" /> ¡Atención! Se ha excedido el
              presupuesto asignado.
            </p>
          )}
        </div>
      )}

      {/* 📋 LISTA DE SUBTAREAS */}
      <div className="p-5 space-y-2.5">
        {ticket.subtasks?.length === 0 && !isAddingSubtask && (
          <div className="border border-dashed border-layout-border rounded-lg p-5 text-center bg-layout-app/50">
            <p className="text-sm font-medium text-content-muted">
              {isProjectTicket && globalKpi
                ? "Aporta a la meta del equipo en la parte superior."
                : "Añade una subtarea para dividir el trabajo."}
            </p>
          </div>
        )}

        {ticket.subtasks?.map((st) => {
          const assigneeName = users.find((u) => u.id === st.assigneeId)?.name;
          const isProjectTask = st.projectAction?.kpis?.length > 0;
          const kpi = isProjectTask ? st.projectAction.kpis[0] : null;
          const isFinancial = kpi?.type === "FINANCIAL";
          const isOverBudget = isFinancial && kpi.currentValue > kpi.target;
          // Si es financiero nunca lo cerramos automático
          const isDone = isProjectTask
            ? isFinancial
              ? false
              : kpi.currentValue >= kpi.target
            : st.isDone;

          return (
            <div
              key={st.id}
              className={`flex flex-col p-3 rounded-xl border transition-all group ${isDone ? "bg-layout-app border-layout-border/50 opacity-75" : "bg-layout-surface border-layout-border hover:border-brand/30 hover:shadow-sm"}`}
            >
              <div className="flex items-start justify-between">
                <div
                  className={`flex items-start gap-3 flex-1 ${!isProjectTask && "cursor-pointer"}`}
                  onClick={() =>
                    !isProjectTask && handleToggleSubtask(st.id, isDone)
                  }
                >
                  <div className="mt-0.5 shrink-0 transition-colors">
                    {isDone ? (
                      <CheckSquare className="w-5 h-5 text-status-success" />
                    ) : isProjectTask && kpi.type === "MILESTONE" ? (
                      <Flag className="w-5 h-5 text-amber-500" />
                    ) : isProjectTask ? (
                      <Target className="w-5 h-5 text-brand" />
                    ) : (
                      <Square className="w-5 h-5 text-layout-border group-hover:text-brand transition-colors" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p
                      className={`text-sm font-medium transition-all truncate ${isDone ? "text-content-disabled line-through" : "text-content-main"}`}
                    >
                      {st.title}
                      {isProjectTask && (
                        <span className="text-[10px] bg-brand-subtle text-brand px-1.5 py-0.5 rounded ml-2 font-bold uppercase tracking-wide">
                          {kpi.type === "MILESTONE"
                            ? "HITO"
                            : kpi.type === "FINANCIAL"
                              ? "FINANZAS"
                              : "KPI"}
                        </span>
                      )}
                    </p>

                    {assigneeName && (
                      <div className="flex items-center gap-1.5 mt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white ${isDone ? "bg-content-disabled" : "bg-status-neutral"}`}
                        >
                          {getInitials(assigneeName)}
                        </div>
                        <span
                          className={`text-xs font-medium ${isDone ? "text-content-disabled" : "text-content-muted"}`}
                        >
                          {assigneeName}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isCreator && !isProjectTask && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSubtask(st.id);
                    }}
                    className="text-content-muted hover:text-status-danger p-1.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer rounded-md hover:bg-status-danger/10 shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {isProjectTask && !isDone && (
                <div className="mt-3 ml-8 pt-3 border-t border-layout-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-medium text-content-muted">
                      Progreso:{" "}
                      <strong className="text-brand">
                        {kpi.type === "FINANCIAL" ? "$" : ""}
                        {kpi.currentValue.toLocaleString()}
                      </strong>{" "}
                      / {kpi.type === "FINANCIAL" ? "$" : ""}
                      {kpi.target.toLocaleString()} {kpi.unit}
                    </span>
                    <span className="text-xs font-bold text-content-muted">
                      {((kpi.currentValue / kpi.target) * 100).toFixed(0)}%
                    </span>
                  </div>
                  {st.assigneeId === activeUserId && (
                    <KpiReporter
                      kpi={kpi}
                      kpiValue={kpiValues[st.id] || ""}
                      setKpiValue={(val) =>
                        setKpiValues((prev) => ({ ...prev, [st.id]: val }))
                      }
                      isReporting={isReporting}
                      onReport={(val) => handleReportKpi(kpi.id, val, false)}
                    />
                  )}
                  <span className="text-xs font-medium text-content-muted">
                    {isFinancial ? "Gasto:" : "Progreso:"}{" "}
                    <strong
                      className={
                        isOverBudget ? "text-status-danger" : "text-brand"
                      }
                    >
                      {isFinancial ? "$" : ""}
                      {kpi.currentValue.toLocaleString()}
                    </strong>{" "}
                    / {isFinancial ? "$" : ""}
                    {kpi.target.toLocaleString()} {kpi.unit}
                  </span>
                </div>
              )}
            </div>
          );
        })}

        {/* Formulario Inline Subtarea Normal */}
        {isAddingSubtask && (
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center bg-layout-surface p-3 rounded-xl border border-layout-border shadow-sm mt-4 animate-fade-in ring-1 ring-brand/5">
            <input
              type="text"
              autoFocus
              placeholder="¿Qué se necesita hacer?..."
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddSubtask()}
              className="flex-1 w-full bg-layout-app border border-layout-border rounded-md px-3 py-2 text-sm text-content-main focus:outline-none focus:ring-1 focus:ring-brand"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <select
                value={newSubtaskAssignee}
                onChange={(e) => setNewSubtaskAssignee(e.target.value)}
                className="w-full sm:w-32 bg-layout-app border border-layout-border rounded-md px-2 py-2 text-xs text-content-main focus:outline-none focus:ring-1 focus:ring-brand cursor-pointer"
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
                className="bg-brand text-white px-3 py-2 rounded-md text-xs font-semibold hover:bg-brand-hover disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Guardar
              </button>
              <button
                onClick={() => setIsAddingSubtask(false)}
                className="text-content-muted hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md cursor-pointer border border-transparent hover:border-layout-border"
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
