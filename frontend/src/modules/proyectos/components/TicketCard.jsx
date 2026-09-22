import { useState, useEffect } from "react";
import { 
  Circle, 
  CheckCircle, 
  CheckSquare, 
  MessageSquare,
  ArrowDown, 
  Minus, 
  ArrowUp, 
  AlertTriangle,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import dayjs from "dayjs";
import { PRIORITY_CONFIG, STATUS_CONFIG, getInitials } from "../../../utils/constants";
import { toggleSubtask } from "../services/subtasks.api";

const ICON_MAP = { ArrowDown, Minus, ArrowUp, AlertTriangle };

const getSemanticStatus = (status) => {
  const map = {
    NUEVO: "bg-status-neutral/10 text-status-neutral",
    PENDIENTE: "bg-status-neutral/10 text-status-neutral",
    EN_PROGRESO: "bg-status-warning/10 text-status-warning",
    REVISION: "bg-status-warning/10 text-status-warning",
    COMPLETADO: "bg-status-success/10 text-status-success",
  };
  return map[status] || map.NUEVO;
};

const getSemanticPriority = (priority) => {
  const map = {
    BAJA: "text-status-neutral",
    MEDIA: "text-status-warning",
    ALTA: "text-brand",
    URGENTE: "text-status-danger font-bold",
  };
  return map[priority] || map.MEDIA;
};

export default function TicketCard({
  ticket,
  activeUserId,
  onClick,
  variant = "assignee",
}) {
  const [isExpanded, setIsExpanded] = useState(false); 
  const [localSubtasks, setLocalSubtasks] = useState(ticket.subtasks || []);


  useEffect(() => {
    setLocalSubtasks(ticket.subtasks || []);
  }, [ticket.subtasks]);

  const isCompleted = ticket.status === "COMPLETADO";
  const statusConfig = STATUS_CONFIG[ticket.status] ?? STATUS_CONFIG.NUEVO;
  const priorityConfig = PRIORITY_CONFIG[ticket.priority];
  const IconoDinamico = ICON_MAP[priorityConfig?.icon];
  

  const totalSubtasks = localSubtasks.length;
  const completedSubtasks = localSubtasks.filter(s => s.isDone).length; 
  
  const mainProgress = ticket.projectAction?.progress || 0; 
  const commentsCount = ticket.comments?.length || 0;
  const isOverdue = ticket.dueDate && dayjs(ticket.dueDate).isBefore(dayjs(), "day") && !isCompleted;

  const handleToggle = async (e, subtaskId, currentStatus) => {
    e.stopPropagation(); 
    const newStatus = !currentStatus;

    const updatedSubtasks = localSubtasks.map(sub => 
      sub.id === subtaskId ? { ...sub, isDone: newStatus } : sub
    );
    setLocalSubtasks(updatedSubtasks);

    try {
      await toggleSubtask(subtaskId, newStatus, activeUserId);
    } catch (error) {
      // Si falla el servidor, deshacemos el cambio visualmente para evitar desincronización
      console.error("Error al actualizar la subtarea:", error);
      setLocalSubtasks(localSubtasks);
      alert("Hubo un error de conexión al actualizar la subtarea.");
    }
  };

  const footer = (
    <div className="flex justify-between items-center mt-3 pt-3 border-t border-layout-border gap-4">
      <div className="flex items-center gap-2 min-w-0">
        <span className="text-xs font-medium text-content-muted shrink-0">
          {variant === "assignee" ? "Por" : "Para"}
        </span>
        <span className="text-xs font-semibold text-content-main truncate">
          {variant === "assignee" 
            ? ticket.creator?.name 
            : ticket.assignees.map((a) => (a.id === activeUserId ? `${a.name} (Tú)` : a.name)).join(", ")}
        </span>
      </div>

      <div className="shrink-0">
        {isCompleted ? (
          <span className="flex items-center gap-1 text-xs font-semibold text-status-success">
            <CheckCircle className="w-4 h-4" /> Resuelta
          </span>
        ) : (
          <div className={`flex items-center gap-1.5 text-xs font-medium ${isOverdue ? "text-red-500 font-bold" : "text-content-muted"}`}>
            {ticket.dueDate ? new Date(ticket.dueDate).toLocaleDateString("es-MX") : "Sin límite"}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      onClick={onClick}
      className={`group flex flex-col p-4 bg-layout-surface hover:bg-layout-hover transition-colors cursor-pointer ${isCompleted ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3 w-full">
        <div className="flex-1 min-w-0">
          <h4 className={`text-sm font-medium mb-2 transition-all truncate ${isCompleted ? "text-content-disabled line-through" : "text-content-main"}`}>
            {ticket.title}
          </h4>
          
          <div className="flex flex-wrap items-center gap-y-2 gap-x-3 mb-1.5">
            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider ${getSemanticStatus(ticket.status)}`}>
              {statusConfig.label}
            </span>
            
            <span className="w-1 h-1 rounded-full bg-layout-border shrink-0"></span>
            
            <span className={`flex items-center gap-1 text-[11px] font-medium uppercase tracking-wider shrink-0 ${getSemanticPriority(ticket.priority)}`}>
              {IconoDinamico && <IconoDinamico size={14} strokeWidth={2.5} />}
              {priorityConfig?.label ?? ticket.priority}
            </span>

            {(totalSubtasks > 0 || commentsCount > 0) && (
               <span className="w-1 h-1 rounded-full bg-layout-border shrink-0"></span>
            )}

            {totalSubtasks > 0 && (
              <button 
                onClick={(e) => {
                  e.stopPropagation(); 
                  setIsExpanded(!isExpanded);
                }}
                className={`flex items-center gap-1 text-[11px] font-medium px-1.5 py-0.5 rounded transition-colors ${isExpanded ? "bg-brand/10 text-brand" : "hover:bg-layout-border/50 text-content-muted"} shrink-0 cursor-pointer`}
              >
                <CheckSquare className="w-3 h-3" />
                <span>{completedSubtasks}/{totalSubtasks}</span>
                {isExpanded ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
              </button>
            )}

            {commentsCount > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-medium text-content-muted shrink-0">
                <MessageSquare className="w-3 h-3" />
                <span>{commentsCount}</span>
              </div>
            )}
          </div>

          {mainProgress > 0 && !isCompleted && (
            <div className="w-full h-1 bg-layout-border/30 rounded-full overflow-hidden mt-2.5 mb-1.5 flex">
              <div 
                className="h-full bg-brand transition-all duration-500" 
                style={{ width: `${mainProgress}%` }} 
              />
            </div>
          )}

          {footer}
        </div>
      </div>

      {isExpanded && totalSubtasks > 0 && (
        <div className="mt-4 pt-3 border-t border-layout-border/50 flex flex-col gap-2 animate-fade-in" onClick={(e) => e.stopPropagation()}>
          {localSubtasks.map((sub) => (
            <div key={sub.id} className="flex flex-col gap-1.5 p-2 rounded-md hover:bg-layout-border/30 transition-colors">
              <div className="flex items-start gap-2">
                <input 
                  type="checkbox" 
                  checked={sub.isDone}
                  onChange={(e) => handleToggle(e, sub.id, sub.isDone)}
                  className="mt-0.5 rounded border-layout-border text-brand focus:ring-brand cursor-pointer shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className={`text-[13px] font-medium leading-tight truncate ${sub.isDone ? "text-content-disabled line-through" : "text-content-main"}`}>
                    {sub.title}
                  </p>
                  <p className="text-[11px] text-content-muted truncate mt-0.5">
                    Resp: <span className="font-semibold">{sub.assignee?.name}</span>
                  </p>
                </div>
              </div>
              
              {sub.projectAction && (
                <div className="flex items-center gap-2 pl-6">
                  <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${sub.projectAction.progress >= 100 ? "bg-status-success" : "bg-brand"}`} 
                      style={{ width: `${Math.min(sub.projectAction.progress, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-bold text-content-muted w-8 text-right">
                    {Math.round(sub.projectAction.progress)}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}