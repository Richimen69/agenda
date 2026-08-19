import { Calendar, Users } from "lucide-react";

// 1. Diccionarios de mapeo para los Enums
const HEALTH_MAP = {
  GREEN:  { color: "bg-status-success", label: "Óptimo" },
  YELLOW: { color: "bg-status-warning", label: "Precaución" },
  RED:    { color: "bg-status-danger",  label: "Crítico" }
};

const STATUS_MAP = {
  NEW: { 
    style: "bg-status-neutral/10 text-status-neutral border-status-neutral/20", 
    label: "Nuevo" 
  },
  IN_PROGRESS: { 
    style: "bg-brand-subtle text-brand border-brand/20", 
    label: "En progreso" 
  },
  REVIEW: { 
    style: "bg-status-warning/10 text-status-warning border-status-warning/20", 
    label: "En revisión" 
  },
  COMPLETED: { 
    style: "bg-status-success/10 text-status-success border-status-success/20", 
    label: "Completado" 
  }
};

export default function ProjectCard({ project }) {
  const progress = Math.min(100, Math.max(0, project.globalProgress ?? 0));
  const membersCount = project.members?.length || 0;

  // Extraemos la configuración visual basada en los enums (con valores por defecto por seguridad)
  const healthDef = HEALTH_MAP[project.health] || { color: "bg-layout-border", label: project.health };
  const statusDef = STATUS_MAP[project.status] || { style: "bg-layout-border text-content-muted", label: project.status };

  return (
    <div className="bg-layout-surface border border-layout-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200">
      
      {/* 1. Cabecera: Salud y Estado */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${healthDef.color}`} />
          <p className="text-xs font-semibold text-content-main uppercase tracking-wider">
            {healthDef.label}
          </p>
        </div>
        <div className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusDef.style}`}>
          {statusDef.label}
        </div>
      </div>

      {/* 2. Contenido principal */}
      <div>
        <h3 className="text-lg font-bold text-content-main leading-tight mb-1">
          {project.title}
        </h3>
        <p className="text-sm text-content-muted line-clamp-2" title={project.description}>
          {project.description}
        </p>
      </div>

      {/* 3. Progreso Ejecutivo */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between items-end">
          <p className="text-xs font-medium text-content-muted uppercase tracking-wider">
            Avance
          </p>
          <p className="text-sm font-bold text-content-main">{progress}%</p>
        </div>
        <div className="bg-layout-border h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-brand h-full rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 4. Pie de tarjeta (Metadatos) */}
      <div className="flex items-center justify-between pt-4 mt-auto border-t border-layout-border text-content-muted">
        <div className="flex items-center gap-1.5">
          <Calendar size={16} strokeWidth={1.5} />
          <p className="text-xs font-medium">
            {new Date(project.targetDate).toLocaleDateString("es-MX", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <Users size={16} strokeWidth={1.5} />
          <p className="text-xs font-medium">
            {membersCount} {membersCount === 1 ? "Miembro" : "Miembros"}
          </p>
        </div>
      </div>

    </div>
  );
}