import { useState } from "react";
import { createTicket } from "../services/api";
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
import { FILTER_OPTIONS } from "../utils/constants";

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
  const allMisTareas = tickets.filter((t) =>
    t.assignees.some((a) => a.id === activeUserId),
  );
  const allDelegadas = tickets.filter(
    (t) =>
      t.creatorId === activeUserId &&
      !t.assignees.some((a) => a.id === activeUserId),
  );
  const totalTareas = allMisTareas.length + allDelegadas.length;
  const completadas = [...allMisTareas, ...allDelegadas].filter(
    (t) => t.status === "COMPLETADO",
  ).length;

  // Filtradas
  const misTareas = allMisTareas.filter(
    (t) => activeFilter === "TODOS" || t.status === activeFilter,
  );
  const delegadas = allDelegadas.filter(
    (t) => activeFilter === "TODOS" || t.status === activeFilter,
  );

  const formatStatus = (status) =>
    status
      .replace("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (l) => l.toUpperCase());

  const handleCreateProject = async ({
    title,
    description,
    assigneeIds,
    dueDate,
    priority,
    subtasks,
  }) => {
    const result = await createTicket({
      title,
      description,
      creatorId: activeUserId,
      assigneeIds,
      dueDate,
      priority,
      subtasks,
    });
    if (result.success) onStatusChange();
    return result;
  };

  const kpis = [
    {
      label: "Total Tareas",
      value: totalTareas,
      icon: <CheckSquare className="w-5 h-5" />,
      color: "gray",
    },
    {
      label: "Debo Hacer (Asignado)",
      value: allMisTareas.length,
      icon: <User className="w-5 h-5" />,
      color: "indigo",
    },
    {
      label: "Mandé a Hacer",
      value: allDelegadas.length,
      icon: <UserCheck className="w-5 h-5" />,
      color: "orange",
    },
    {
      label: "Completadas",
      value: completadas,
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: "green",
    },
  ];

  const colorMap = {
    gray: { text: "text-gray-400", bg: "bg-gray-50", label: "text-gray-400" },
    indigo: {
      text: "text-indigo-600",
      bg: "bg-indigo-50",
      label: "text-indigo-600",
    },
    orange: {
      text: "text-orange-500",
      bg: "bg-orange-50",
      label: "text-orange-500",
    },
    green: {
      text: "text-green-500",
      bg: "bg-green-50",
      label: "text-green-500",
    },
  };

  return (
    <section className="space-y-6">
      {/* Botón nuevo */}
      <div className="flex justify-end mb-2">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, color }) => {
          const c = colorMap[color];
          return (
            <div
              key={label}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex justify-between items-center"
            >
              <div>
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${c.label}`}
                >
                  {label}
                </p>
                <p className="text-3xl font-bold text-gray-900">{value}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl ${c.bg} flex items-center justify-center ${c.text}`}
              >
                {icon}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Filter className="w-4 h-4" />
          <span>
            Filtros Activos:{" "}
            <strong className="text-gray-900">
              {activeFilter === "TODOS"
                ? "Todos los Proyectos"
                : `Estado: ${formatStatus(activeFilter)}`}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <span className="text-gray-500">Estado:</span>
          {FILTER_OPTIONS.map((opt) => (
            <span
              key={opt.value}
              onClick={() => setActiveFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg cursor-pointer transition-colors font-bold
                ${activeFilter === opt.value ? "bg-indigo-50 text-indigo-600 shadow-sm" : "hover:bg-gray-50 text-gray-500"}`}
            >
              {opt.label}
            </span>
          ))}
        </div>
      </div>

      {/* Columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Mis Tareas */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <User className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Mis Tareas (Responsable)
              </h3>
            </div>
            <span className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-bold">
              {misTareas.length}
            </span>
          </div>
          <div className="space-y-4">
            {misTareas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                {activeFilter === "TODOS"
                  ? "No tienes tareas asignadas."
                  : `No hay tareas con estado "${formatStatus(activeFilter)}".`}
              </p>
            ) : (
              misTareas.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  activeUserId={activeUserId}
                  variant="assignee"
                  onClick={() => onTicketSelect(ticket)}
                />
              ))
            )}
          </div>
        </div>

        {/* Delegadas */}
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Proyectos Delegados (Creador)
                </h3>
                <p className="text-xs text-orange-500 font-medium">
                  Tareas que asignaste a otros • Debes revisar
                </p>
              </div>
            </div>
            <span className="w-6 h-6 rounded-full bg-orange-500 text-white flex items-center justify-center text-xs font-bold">
              {delegadas.length}
            </span>
          </div>
          <div className="space-y-4">
            {delegadas.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-8">
                {activeFilter === "TODOS"
                  ? "No has delegado tareas a otros."
                  : `No hay tareas delegadas con estado "${formatStatus(activeFilter)}".`}
              </p>
            ) : (
              delegadas.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  activeUserId={activeUserId}
                  variant="delegated"
                  onClick={() => onTicketSelect(ticket)}
                />
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
