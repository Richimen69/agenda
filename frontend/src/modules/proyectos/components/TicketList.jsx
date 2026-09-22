import { useState, useEffect } from "react";
import { createTicket, updateTicketStatus } from "../services/tickets.api";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import {
  Plus,
  CheckSquare,
  User,
  UserCheck,
  CheckCircle2,
  Filter,
  LayoutList,
  KanbanSquare,
  AlertTriangle,
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
  const [viewMode, setViewMode] = useState("board");

  const [localTickets, setLocalTickets] = useState(tickets);

  // Sincronizamos el estado local cuando llegan nuevos tickets desde el backend
  useEffect(() => {
    setLocalTickets(tickets);
  }, [tickets]);

  // Usamos localTickets en lugar de tickets para que los cálculos en pantalla se actualicen en tiempo real
  const allMisTareas = localTickets.filter((t) =>
    t.assignees.some((a) => a.id === activeUserId),
  );
  const allDelegadas = localTickets.filter(
    (t) =>
      t.creatorId === activeUserId &&
      !t.assignees.some((a) => a.id === activeUserId),
  );
  const misActivas = allMisTareas.filter(
    (t) => t.status !== "COMPLETADO" && t.status !== "CANCELADO",
  ).length;
  const misCompletadas = allMisTareas.filter(
    (t) => t.status === "COMPLETADO",
  ).length;

  // Métricas de supervisión (Delegadas)
  const delegadasActivas = allDelegadas.filter(
    (t) => t.status !== "COMPLETADO" && t.status !== "CANCELADO",
  ).length;
  const delegadasEnRevision = allDelegadas.filter(
    (t) => t.status === "REVISION",
  ).length;


  const misTareas = allMisTareas
    .filter((t) => activeFilter === "TODOS" || t.status === activeFilter)
    .sort(
      (a, b) =>
        (a.status === "COMPLETADO" || a.status === "CANCELADO" ? 1 : 0) -
        (b.status === "COMPLETADO" || b.status === "CANCELADO" ? 1 : 0),
    );

  const delegadas = allDelegadas
    .filter((t) => activeFilter === "TODOS" || t.status === activeFilter)
    .sort(
      (a, b) =>
        (a.status === "COMPLETADO" || a.status === "CANCELADO" ? 1 : 0) -
        (b.status === "COMPLETADO" || b.status === "CANCELADO" ? 1 : 0),
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

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    // 1. Si soltó fuera del tablero
    if (!destination) return;

    // 2. Si soltó exactamente donde mismo
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    )
      return;

    const targetStatus = destination.droppableId;

    // 3. ACTUALIZACIÓN OPTIMISTA (Movemos la tarjeta en el frontend instantáneamente)
    const updatedTickets = localTickets.map((t) =>
      t.id.toString() === draggableId ? { ...t, status: targetStatus } : t,
    );
    setLocalTickets(updatedTickets);

    // 4. Mandamos llamar a la API por detrás
    try {
      await updateTicketStatus(draggableId, targetStatus, activeUserId);
      onStatusChange(); // Le avisa al padre para que refresque datos reales
    } catch (error) {
      console.error("Error al mover ticket:", error);
      setLocalTickets(tickets); // Si falla, regresamos la tarjeta a su lugar (rollback)
      alert("Hubo un error de conexión al mover la tarea.");
    }
  };

  const kpis = [
    {
      label: "Mis Tareas (Activas)",
      value: misActivas,
      icon: <CheckSquare className="w-5 h-5" />,
      theme: "brand",
    },
    {
      label: "Mis Completadas",
      value: misCompletadas,
      icon: <CheckCircle2 className="w-5 h-5" />,
      theme: "success",
    },
    {
      label: "Delegadas (Activas)",
      value: delegadasActivas,
      icon: <UserCheck className="w-5 h-5" />,
      theme: "neutral",
    },
    {
      label: "Por Aprobar (Revisión)",
      value: delegadasEnRevision,
      icon: <AlertTriangle className="w-5 h-5" />,
      theme: delegadasEnRevision > 0 ? "warning" : "neutral",
    },
  ];

  const themeMap = {
    neutral: {
      bg: "bg-layout-app",
      text: "text-content-muted",
      iconBg: "bg-layout-border text-content-main",
    },
    brand: {
      bg: "bg-layout-surface",
      text: "text-content-muted",
      iconBg: "bg-brand-subtle text-brand",
    },
    success: {
      bg: "bg-layout-surface",
      text: "text-content-muted",
      iconBg: "bg-status-success/10 text-status-success",
    },
    warning: {
      bg: "bg-status-warning/10",
      text: "text-status-warning",
      iconBg: "bg-status-warning/20 text-status-warning",
    },
  };

  const KANBAN_COLUMNS = [
    "NUEVO",
    "EN_PROGRESO",
    "EN_ESPERA",
    "REVISION",
    "COMPLETADO",
  ];

  const getColumnStyles = (status) => {
    const styles = {
      PENDIENTE: {
        container: "border-layout-border bg-layout-app",
        header: "text-content-main",
        badge: "bg-layout-border text-content-main",
      },
      EN_PROGRESO: {
        container: "border-blue-200 bg-blue-50/30",
        header: "text-blue-700",
        badge: "bg-blue-100 text-blue-700",
      },
      EN_ESPERA: {
        container: "border-red-200 bg-red-50/50 ring-1 ring-red-100",
        header: "text-red-600 font-bold",
        badge: "bg-red-100 text-red-600",
      },
      REVISION: {
        container: "border-amber-200 bg-amber-50/30",
        header: "text-amber-700",
        badge: "bg-amber-100 text-amber-700",
      },
      COMPLETADO: {
        container: "border-status-success/30 bg-status-success/5",
        header: "text-status-success",
        badge: "bg-status-success/20 text-status-success",
      },
    };
    return styles[status] || styles.PENDIENTE;
  };

  return (
    <section className="space-y-6 max-w-350 mx-auto">
      {/* HEADER y KPIS */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-content-main tracking-tight">
            Gestión de tareas
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Crea, asigna y da seguimiento a las tareas del equipo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nueva Tarea
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(({ label, value, icon, theme }) => {
          const t = themeMap[theme];
          return (
            <div
              key={label}
              className="bg-layout-surface rounded-xl border border-layout-border p-5 shadow-sm flex justify-between items-center"
            >
              <div>
                <p className="text-xs font-semibold text-content-muted uppercase tracking-wider mb-1">
                  {label}
                </p>
                <p className="text-3xl font-bold text-content-main">{value}</p>
              </div>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center transition-colors ${t.iconBg}`}
              >
                {icon}
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-layout-surface rounded-xl border border-layout-border p-2 px-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-2 text-sm text-content-muted w-full md:w-auto">
          {viewMode === "list" ? (
            <>
              <Filter className="w-4 h-4" />
              <span className="hidden sm:inline">
                Filtros:{" "}
                <strong className="text-content-main font-medium">
                  {activeFilter === "TODOS"
                    ? "Todas las Tareas"
                    : formatStatus(activeFilter)}
                </strong>
              </span>
            </>
          ) : (
            <>
              <KanbanSquare className="w-4 h-4" />
              <span className="font-medium text-content-main">
                Tablero Visual
              </span>
            </>
          )}
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          {viewMode === "list" && (
            <div className="flex items-center bg-layout-app p-1 rounded-lg border border-layout-border overflow-x-auto">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setActiveFilter(opt.value)}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-md whitespace-nowrap transition-all duration-200 cursor-pointer ${activeFilter === opt.value ? "bg-layout-surface text-content-main shadow-sm ring-1 ring-layout-border/50" : "text-content-muted hover:text-content-main hover:bg-layout-hover"}`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center bg-layout-app p-1 rounded-lg border border-layout-border shrink-0">
            <button
              onClick={() => setViewMode("list")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "list" ? "bg-white shadow-sm text-content-main ring-1 ring-layout-border/50" : "text-content-muted hover:text-content-main"}`}
            >
              <LayoutList className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("board")}
              className={`p-1.5 rounded-md transition-all cursor-pointer ${viewMode === "board" ? "bg-white shadow-sm text-content-main ring-1 ring-layout-border/50" : "text-content-muted hover:text-content-main"}`}
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {viewMode === "list" ? (
        // --- VISTA LISTA ---
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-layout-border bg-layout-app/50">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white border border-layout-border rounded-md text-content-muted">
                  <User className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-semibold text-content-main tracking-tight">
                  Mis Tareas (Responsable)
                </h3>
              </div>
              <span className="bg-layout-border text-content-main px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {misTareas.length}
              </span>
            </div>
            <div className="flex flex-col">
              {misTareas.length === 0 ? (
                <div className="px-6 py-10 flex flex-col items-center justify-center text-content-muted">
                  <CheckSquare className="w-10 h-10 mb-3 opacity-20" />
                  <p className="text-sm font-medium text-center">
                    Bandeja limpia.
                  </p>
                </div>
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

          <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
            <div className="flex justify-between items-center px-5 py-4 border-b border-layout-border bg-layout-app/50">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-white border border-layout-border rounded-md text-content-muted">
                  <UserCheck className="w-4 h-4" />
                </div>
                <h3 className="text-[15px] font-semibold text-content-main tracking-tight">
                  Delegados (Creador)
                </h3>
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
                    No has delegado tareas.
                  </p>
                </div>
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
      ) : (
        // --- VISTA TABLERO KANBAN ---
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex overflow-x-auto pb-6 gap-5 items-start min-h-[60vh] snap-x custom-scrollbar">
            {KANBAN_COLUMNS.map((colStatus) => {
              const columnTickets = allMisTareas
                .filter(
                  (t) =>
                    t.status === colStatus ||
                    (colStatus === "PENDIENTE" && t.status === "NUEVO"),
                )
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

              const styles = getColumnStyles(colStatus);

              return (
                <Droppable key={colStatus} droppableId={colStatus}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`rounded-xl border shrink-0 w-80 flex flex-col max-h-[75vh] snap-center transition-colors duration-200 
                        ${styles.container} 
                        ${snapshot.isDraggingOver ? "ring-2 ring-brand ring-opacity-50" : "shadow-sm"}
                      `}
                    >
                      <div className="px-4 py-3 border-b border-layout-border/20 flex justify-between items-center sticky top-0 z-10 rounded-t-xl bg-inherit">
                        <h3
                          className={`text-[13px] font-bold tracking-wide uppercase ${styles.header}`}
                        >
                          {formatStatus(colStatus)}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${styles.badge}`}
                        >
                          {columnTickets.length}
                        </span>
                      </div>

                      <div className="p-3 flex flex-col gap-3 overflow-y-auto custom-scrollbar flex-1 min-h-37.5">
                        {columnTickets.length === 0 &&
                          !snapshot.isDraggingOver && (
                            <div className="py-10 flex flex-col items-center text-center text-content-muted text-xs font-medium border-2 border-dashed border-layout-border/50 rounded-lg opacity-60">
                              <span>Columna vacía</span>
                            </div>
                          )}
                        {columnTickets.map((ticket, index) => {
                          const isAssignee = ticket.assignees.some(
                            (a) => a.id === activeUserId,
                          );
                          return (
                            <Draggable
                              key={ticket.id}
                              draggableId={ticket.id.toString()}
                              index={index}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  style={{ ...provided.draggableProps.style }}
                                  className={`shrink-0 bg-layout-surface rounded-lg border border-layout-border overflow-hidden transition-all duration-200
                                    ${snapshot.isDragging ? "shadow-2xl scale-[1.02] rotate-1 ring-2 ring-brand z-50 cursor-grabbing" : "shadow-sm hover:ring-2 ring-brand-subtle cursor-grab"}
                                  `}
                                >
                                  <TicketCard
                                    ticket={ticket}
                                    activeUserId={activeUserId}
                                    variant={
                                      isAssignee ? "assignee" : "delegated"
                                    }
                                    onClick={() => onTicketSelect(ticket)}
                                  />
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        </DragDropContext>
      )}

      <CreateTicketModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        onSubmit={handleCreateProject}
      />
    </section>
  );
}
