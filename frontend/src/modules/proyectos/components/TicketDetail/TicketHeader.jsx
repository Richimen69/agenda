import { ArrowLeft, Trash2 } from "lucide-react";

const STATUS_OPTIONS = [
  { value: "NUEVO", label: "Nuevo" },
  { value: "EN_PROGRESO", label: "En Progreso" },
  { value: "REVISION", label: "Revisión" },
  { value: "COMPLETADO", label: "Completado" },
];

// Helper: Selector dinámico de colores corporativos
const getSemanticStatusSelect = (status) => {
  const map = {
    NUEVO: "bg-status-neutral/10 text-status-neutral hover:bg-status-neutral/20",
    EN_PROGRESO: "bg-status-warning/10 text-status-warning hover:bg-status-warning/20",
    REVISION: "bg-status-warning/10 text-status-warning hover:bg-status-warning/20",
    COMPLETADO: "bg-status-success/10 text-status-success hover:bg-status-success/20",
  };
  return map[status] || map.NUEVO;
};

export default function TicketHeader({
  ticket,
  isCreator,
  onBack,
  onStatusChange,
  onDeleteRequest,
}) {
  return (
    <div className="bg-layout-surface rounded-xl px-5 py-4 flex items-center justify-between border border-layout-border shadow-sm">
      
      {/* Sección Izquierda: Navegación y Título */}
      <div className="flex items-center gap-4 min-w-0 pr-4">
        
        {/* Botón Volver */}
        <button
          onClick={onBack}
          className="p-2 text-content-muted hover:text-content-main bg-layout-app border border-layout-border hover:bg-layout-hover rounded-lg transition-colors cursor-pointer shrink-0 shadow-sm"
          title="Volver a proyectos"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        
        {/* Título y Metadatos */}
        <div className="min-w-0 flex flex-col justify-center">
          {/* El título NO va en mayúsculas. Usamos line-clamp para truncarlo si es absurdamente largo */}
          <h1 className="text-lg sm:text-xl font-bold text-content-main tracking-tight truncate">
            {ticket.title}
          </h1>
          <div className="flex items-center mt-1">
            <span className="text-xs font-medium text-content-muted mr-2">ID del Proyecto:</span>
            {/* Pill técnico y monoespaciado para el ID */}
            <span className="font-mono text-[11px] font-semibold bg-layout-app text-content-main border border-layout-border px-1.5 py-0.5 rounded shadow-sm">
              #task-{ticket.id.split("-")[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Sección Derecha: Controles */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Botón Eliminar (Peligro real visual) */}
        {isCreator && (
          <button
            onClick={onDeleteRequest}
            className="p-2 cursor-pointer text-content-muted hover:text-status-danger hover:bg-status-danger/10 rounded-md transition-colors outline-none"
            title="Eliminar Proyecto"
          >
            <Trash2 className="w-4 h-4" strokeWidth={2.5} />
          </button>
        )}
        
        {/* Divisor Visual */}
        {isCreator && <div className="w-px h-6 bg-layout-border mx-1"></div>}

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-content-muted uppercase tracking-wider hidden sm:inline-block">
            Estado
          </span>
          
          {/* Select Dinámico (Magia CSS y Semántica) */}
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value)}
            className={`font-bold text-xs uppercase tracking-wider rounded-md pl-3 pr-8 py-2 border-none focus:ring-2 focus:ring-brand/20 cursor-pointer appearance-none transition-colors shadow-sm outline-none ${getSemanticStatusSelect(ticket.status)}`}
            style={{
              // Modifiqué el SVG de tu código original para que el 'stroke' sea 'currentColor'. 
              // Así la flechita hereda el color del texto automáticamente (Verde, Naranja o Gris).
              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='currentColor' stroke-linecap='round' stroke-linejoin='round' stroke-width='2.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
              backgroundPosition: "right 0.5rem center",
              backgroundRepeat: "no-repeat",
              backgroundSize: "1.2em 1.2em",
            }}
          >
            {STATUS_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value} className="text-content-main bg-layout-surface">
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}