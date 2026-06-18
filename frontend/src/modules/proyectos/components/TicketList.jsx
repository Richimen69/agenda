import { useState } from "react";
import { createTicket } from "../../../services/api";
import {
  Plus,
  CheckSquare,
  User,
  UserCheck,
  CheckCircle2,
  Filter,
} from "lucide-react";
import CreateTicketModal from "./CreateTicketModal";
import TicketCard from "./TicketCard";
import { FILTER_OPTIONS } from "../../../utils/constants";

export default function TicketList({
  tickets,
  users,
  activeUserId,
  onStatusChange,
  onTicketSelect,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("TODOS");

  // KPIs
  const allMisTareas = tickets.filter((t) => t.assignees.some((a) => a.id === activeUserId));
  const allDelegadas = tickets.filter((t) => t.creatorId === activeUserId && !t.assignees.some((a) => a.id === activeUserId));
  const totalTareas = allMisTareas.length + allDelegadas.length;
  const completadas = [...allMisTareas, ...allDelegadas].filter((t) => t.status === "COMPLETADO").length;

  // Filtradas
  const misTareas = allMisTareas.filter((t) => activeFilter === "TODOS" || t.status === activeFilter);
  const delegadas = allDelegadas.filter((t) => activeFilter === "TODOS" || t.status === activeFilter);

  const formatStatus = (status) =>
    status.replace("_", " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());

  const handleCreateProject = async ({ title, description, assigneeIds, dueDate, priority, subtasks }) => {
    const result = await createTicket({ title, description, creatorId: activeUserId, assigneeIds, dueDate, priority, subtasks });
    if (result.success) onStatusChange();
    return result;
  };

  // KPI Array refactorizado: Semántica seria, no arcoíris.
  const kpis = [
    {
      label: "Total Tareas",
      value: totalTareas,
      icon: <CheckSquare className="w-5 h-5" />,
      theme: "neutral",
    },
    {
      label: "Debo Hacer (Asignado)",
      value: allMisTareas.length,
      icon: <User className="w-5 h-5" />,
      theme: "brand", // Usamos un tinte sutil corporativo
    },
    {
      label: "Mandé a Hacer",
      value: allDelegadas.length,
      icon: <UserCheck className="w-5 h-5" />,
      theme: "neutral",
    },
    {
      label: "Completadas",
      value: completadas,
      icon: <CheckCircle2 className="w-5 h-5" />,
      theme: "success", // Único KPI que merece color verde (Refuerzo positivo)
    },
  ];

  // Diccionario estricto conectado a Tailwind v4 CSS vars
  const themeMap = {
    neutral: { bg: "bg-layout-app", text: "text-content-muted", iconBg: "bg-layout-border text-content-main" },
    brand:   { bg: "bg-layout-surface", text: "text-content-muted", iconBg: "bg-brand-subtle text-brand" },
    success: { bg: "bg-layout-surface", text: "text-content-muted", iconBg: "bg-status-success/10 text-status-success" },
  };

  return (
    <section className="space-y-6 max-w-[1400px] mx-auto">
      
      {/* 1. HEADER ESTRUCTURAL (Jerarquía de Página) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-content-main tracking-tight">Gestión de Proyectos</h1>
          <p className="text-sm text-content-muted mt-1">Crea, asigna y da seguimiento a las tareas del equipo.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* 2. KPIs (Tarjetas sobrias y consistentes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, theme }) => {
          const t = themeMap[theme];
          return (
            <div key={label} className="bg-layout-surface rounded-xl border border-layout-border p-5 shadow-sm flex justify-between items-center">
              <div>
                {/* Corregido: text-[10px] a text-xs para cumplir WCAG 2.1 */}
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-3xl font-bold text-content-main">{value}</p>
              </div>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${t.iconBg}`}>
                {icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. BARRA DE FILTROS (Segmented Control UI) */}
      <div className="bg-layout-surface rounded-xl border border-layout-border p-2 px-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-content-muted">
          <Filter className="w-4 h-4" />
          <span>Filtros: <strong className="text-content-main font-medium">{activeFilter === "TODOS" ? "Todos los Proyectos" : formatStatus(activeFilter)}</strong></span>
        </div>
        
        {/* Contenedor del Segmented Control */}
        <div className="flex items-center bg-layout-app p-1 rounded-lg border border-layout-border overflow-x-auto w-full md:w-auto">
          {FILTER_OPTIONS.map((opt) => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive 
                    ? "bg-layout-surface text-content-main shadow-sm ring-1 ring-layout-border/50" 
                    : "text-content-muted hover:text-content-main hover:bg-layout-hover"
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. COLUMNAS DE DATOS (Alta Densidad de Información) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        
        {/* Columna: Mis Tareas */}
        {/* Corregido: rounded-3xl a rounded-xl, eliminados los padding internos excesivos */}
        <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
          {/* Header de Columna Diferenciado */}
          <div className="flex justify-between items-center px-5 py-4 border-b border-layout-border bg-layout-app/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-layout-border rounded-md text-content-muted">
                <User className="w-4 h-4" />
              </div>
              <h3 className="text-[15px] font-semibold text-content-main tracking-tight">Mis Tareas (Responsable)</h3>
            </div>
            <span className="bg-layout-border text-content-main px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {misTareas.length}
            </span>
          </div>
          
          {/* Lista sin espacios (space-y-4 eliminado). El TicketCard ya maneja los bordes */}
          <div className="flex flex-col">
            {misTareas.length === 0 ? (
              <div className="px-6 py-10 flex flex-col items-center justify-center text-content-muted">
                <CheckSquare className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium text-center">
                  {activeFilter === "TODOS" ? "Bandeja limpia. No tienes tareas asignadas." : `No hay tareas en "${formatStatus(activeFilter)}".`}
                </p>
              </div>
            ) : (
              misTareas.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} activeUserId={activeUserId} variant="assignee" onClick={() => onTicketSelect(ticket)} />
              ))
            )}
          </div>
        </div>

        {/* Columna: Delegadas */}
        <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
          <div className="flex justify-between items-center px-5 py-4 border-b border-layout-border bg-layout-app/50">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-white border border-layout-border rounded-md text-content-muted">
                <UserCheck className="w-4 h-4" />
              </div>
              <h3 className="text-[15px] font-semibold text-content-main tracking-tight">Delegados (Creador)</h3>
            </div>
            <span className="bg-layout-border text-content-main px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {delegadas.length}
            </span>
          </div>
          
          <div className="flex flex-col">
            {delegadas.length === 0 ? (
              <div className="px-6 py-10 flex flex-col items-center justify-center text-content-muted">
                <UserCheck className="w-10 h-10 mb-3 opacity-20" />
                <p className="text-sm font-medium text-center">
                  {activeFilter === "TODOS" ? "No has delegado proyectos a tu equipo." : `No hay proyectos delegados en "${formatStatus(activeFilter)}".`}
                </p>
              </div>
            ) : (
              delegadas.map((ticket) => (
                <TicketCard key={ticket.id} ticket={ticket} activeUserId={activeUserId} variant="delegated" onClick={() => onTicketSelect(ticket)} />
              ))
            )}
          </div>
        </div>

      </div>

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        onSubmit={handleCreateProject}
      />
    </section>
  );
}