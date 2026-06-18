import { Circle, CheckCircle } from "lucide-react";
import {
  PRIORITY_CONFIG,
  STATUS_CONFIG,
  getInitials,
} from "../../../utils/constants";
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from "lucide-react";

const ICON_MAP = { ArrowDown, Minus, ArrowUp, AlertTriangle };

// 1. Mapeo estricto al nuevo Sistema UI (Protege contra colores viejos en tus constantes)
const getSemanticStatus = (status) => {
  const map = {
    NUEVO: "bg-status-neutral/10 text-status-neutral",
    EN_PROGRESO: "bg-status-warning/10 text-status-warning",
    REVISION: "bg-status-warning/10 text-status-warning",
    COMPLETADO: "bg-status-success/10 text-status-success",
  };
  return map[status] || map.NUEVO;
};

const getSemanticPriority = (priority) => {
  const map = {
    BAJA: "text-status-neutral", // Gris
    MEDIA: "text-status-warning", // Naranja/Ámbar
    ALTA: "text-brand", // Usamos el Rojo Toyota para llamar la atención
    URGENTE: "text-status-danger font-bold", // Rojo oscuro + Bold para máxima alerta
  };
  return map[priority] || map.MEDIA;
};

export default function TicketCard({
  ticket,
  activeUserId,
  onClick,
  variant = "assignee",
}) {
  const isCompleted = ticket.status === "COMPLETADO";
  const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.NUEVO;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const IconoDinamico = ICON_MAP[priorityConfig?.icon];

  // 2. Footer optimizado (El que construimos previamente)
  const footer =
    variant === "assignee" ? (
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-layout-border">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-content-muted">
            Asignado por
          </span>
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded-full bg-status-neutral text-white flex items-center justify-center text-[9px] font-bold ring-2 ring-layout-surface">
              {getInitials(ticket.creator?.name)}
            </div>
            <span className="text-xs font-semibold text-content-main">
              {ticket.creator?.name}
            </span>
          </div>
        </div>
        {isCompleted ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-status-success">
            <CheckCircle className="w-4 h-4" /> Resuelta
          </span>
        ) : (
          <div className="flex items-center gap-1.5 text-xs font-medium text-content-muted">
            <svg
              className="w-3.5 h-3.5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {ticket.dueDate
              ? new Date(ticket.dueDate).toLocaleDateString("es-MX")
              : "Sin límite"}
          </div>
        )}
      </div>
    ) : (
      <div className="flex justify-between items-center mt-3 pt-3 border-t border-layout-border gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-medium text-content-muted shrink-0">
            Para
          </span>
          <span
            className="text-xs font-semibold text-content-main truncate"
            title={ticket.assignees.map((a) => a.name).join(", ")}
          >
            {ticket.assignees
              .map((a) => (a.id === activeUserId ? `${a.name} (Tú)` : a.name))
              .join(", ")}
          </span>
        </div>
        <div className="shrink-0">
          {ticket.status === "REVISION" ? (
            <button
              type="button"
              className="flex items-center gap-1 text-xs font-semibold bg-status-success hover:bg-status-success/90 text-white px-2.5 py-1.5 rounded-md transition-colors shadow-sm cursor-pointer"
            >
              Aprobar Tarea
            </button>
          ) : isCompleted ? (
            <span className="flex items-center gap-1 text-xs font-semibold text-status-success">
              <CheckCircle className="w-4 h-4" /> Resuelta
            </span>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-medium text-content-muted">
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              {ticket.dueDate
                ? new Date(ticket.dueDate).toLocaleDateString("es-MX")
                : "Sin límite"}
            </div>
          )}
        </div>
      </div>
    );

  // 3. Render Principal (Reducción de ruido visual)
  return (
    <div
      onClick={onClick}
      // Aplicamos opacidad si está completada para dar "cierre" visual. Reemplazamos los bordes de color por un hover sutil del fondo.
      className={`group flex items-start gap-3 p-4 bg-layout-surface border-b border-layout-border hover:bg-layout-hover transition-colors cursor-pointer ${isCompleted ? "opacity-75" : ""}`}
    >
      {/* Ícono Interactivo de Estado */}
      {variant === "assignee" && (
        <div className="pt-0.5 shrink-0">
          {isCompleted ? (
            <CheckCircle className="w-4 h-4 text-status-success" />
          ) : (
            // Al hacer hover en la tarjeta, indicamos que se puede clickear el círculo (Microinteracción)
            <Circle className="w-4 h-4 text-layout-border group-hover:text-brand transition-colors" />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0">
        {/* TÍTULO PRIMERO (F-Pattern) + Tachado si está completado */}
        <h4
          className={`text-sm font-medium mb-1.5 transition-all truncate ${isCompleted ? "text-content-disabled line-through" : "text-content-main"}`}
        >
          {ticket.title}
        </h4>

        {/* BADGES ABAJO (Legibles, text-[11px] es el mínimo WCAG, no 10px) */}
        <div className="flex items-center gap-3 mb-1.5">
          {/* 1. ESTADO (Con fondo, tiene el mayor peso visual) */}
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getSemanticStatus(ticket.status)}`}
          >
            {statusConfig.label}
          </span>

          {/* Divisor sutil opcional para separar conceptos */}
          <span className="w-1 h-1 rounded-full bg-layout-border"></span>

          {/* 2. PRIORIDAD (Sin fondo, solo icono + texto. Más limpio) */}
          <span
            className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider ${getSemanticPriority(ticket.priority)}`}
          >
            {/* Lucide icon perfectamente centrado */}
            {IconoDinamico && (
              <span className="flex items-center justify-center">
                <IconoDinamico size={14} strokeWidth={2.5} />
              </span>
            )}
            {priorityConfig?.label ?? ticket.priority}
          </span>
        </div>

        {footer}
      </div>
    </div>
  );
}
