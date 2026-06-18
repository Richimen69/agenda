import { Calendar } from "lucide-react";
import { ArrowDown, Minus, ArrowUp, AlertTriangle } from "lucide-react";
import { PRIORITY_CONFIG } from "../../../../utils/constants";

const ICON_MAP = { ArrowDown, Minus, ArrowUp, AlertTriangle };

// Helper UX: Formateo de fechas para humanos
const formatHumanDate = (dateStr) => {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "short", // 'short' ahorra espacio visual
    year: "numeric",
  });
};

// Reutilizamos nuestra lógica semántica de prioridad para no depender de colores basura en constantes
const getSemanticPriority = (priority) => {
  const map = {
    BAJA: "text-status-neutral",
    MEDIA: "text-status-warning",
    ALTA: "text-brand",
    URGENTE: "text-status-danger font-bold",
  };
  return map[priority] || map.MEDIA;
};

export default function TicketProperties({ ticket }) {
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const PriorityIcon = ICON_MAP[priorityConfig?.icon];

  return (
    <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
      
      {/* Cabecera unificada (Igual que el Checklist) */}
      <div className="px-5 py-4 border-b border-layout-border bg-layout-app/50">
        <h3 className="text-[14px] font-semibold text-content-main tracking-tight">
          Propiedades
        </h3>
      </div>

      {/* Lista de propiedades (Usamos divide-y en lugar de bordes manuales por fila) */}
      <div className="flex flex-col divide-y divide-layout-border">
        
        {/* Fila: Fecha Límite */}
        <div className="flex justify-between items-center px-5 py-3.5 hover:bg-layout-hover transition-colors">
          <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Fecha Límite
          </span>
          <div className="flex items-center gap-1.5 text-sm font-semibold text-content-main">
            <Calendar className="w-4 h-4 text-content-muted" />
            {formatHumanDate(ticket.dueDate) ?? (
              <span className="text-content-disabled italic font-medium">Sin asignar</span>
            )}
          </div>
        </div>

        {/* Fila: Fecha Inicio */}
        <div className="flex justify-between items-center px-5 py-3.5 hover:bg-layout-hover transition-colors">
          <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Fecha Inicio
          </span>
          <div className="flex items-center gap-1.5 text-sm font-medium text-content-main">
            <Calendar className="w-4 h-4 text-content-muted" />
            {formatHumanDate(ticket.createdAt)}
          </div>
        </div>

        {/* Fila: Prioridad */}
        <div className="flex justify-between items-center px-5 py-3.5 hover:bg-layout-hover transition-colors">
          <span className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Prioridad
          </span>
          {/* Badge semántico sin fondo invasivo */}
          <div
            className={`flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider ${getSemanticPriority(ticket.priority)}`}
          >
            {PriorityIcon && (
              <span className="flex items-center justify-center">
                <PriorityIcon size={14} strokeWidth={2.5} />
              </span>
            )}
            {priorityConfig?.label ?? ticket.priority}
          </div>
        </div>

      </div>
    </div>
  );
}