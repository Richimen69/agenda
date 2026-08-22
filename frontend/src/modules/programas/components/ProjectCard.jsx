import { Calendar, Users, Target } from "lucide-react";

const HEALTH_MAP = {
  GREEN: { color: "bg-status-success", label: "Óptimo" },
  YELLOW: { color: "bg-status-warning", label: "Precaución" },
  RED: { color: "bg-status-danger", label: "Crítico" },
};

const STATUS_MAP = {
  NEW: {
    style: "bg-status-neutral/10 text-status-neutral border-status-neutral/20",
    label: "Nuevo",
  },
  IN_PROGRESS: {
    style: "bg-brand-subtle text-brand border-brand/20",
    label: "En progreso",
  },
  REVIEW: {
    style: "bg-status-warning/10 text-status-warning border-status-warning/20",
    label: "En revisión",
  },
  COMPLETED: {
    style: "bg-status-success/10 text-status-success border-status-success/20",
    label: "Completado",
  },
};

export default function ProjectCard({ project }) {
  const progress = Math.min(100, Math.max(0, project.globalProgress ?? 0));
  const membersCount = project.members?.length || 0;

  const progressColor =
    project.health === "GREEN"
      ? "bg-emerald-500"
      : project.health === "YELLOW"
        ? "bg-amber-400"
        : "bg-rose-500";

  const healthDef = HEALTH_MAP[project.health] || {
    color: "bg-layout-border",
    label: project.health,
  };
  const statusDef = STATUS_MAP[project.status] || {
    style: "bg-layout-border text-content-muted",
    label: project.status,
  };

  const allKpis = Object.values(
    (project.actions || []).reduce((acc, action) => {
      (action.kpis || []).forEach((kpi) => {
        if (!acc[kpi.name]) {
          acc[kpi.name] = {
            id: kpi.name,
            name: kpi.name,
            unit: kpi.unit,
            type: kpi.type,
            target: 0,
            currentValue: 0,
          };
        }
        acc[kpi.name].target += kpi.target;
        acc[kpi.name].currentValue += kpi.currentValue;
      });
      return acc;
    }, {}),
  );

  const displayKpis = allKpis.slice(0, 10);

  return (
    <div className="bg-layout-surface border border-layout-border rounded-xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md transition-all duration-200">
      {/* 1. Cabecera */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${healthDef.color}`} />
          <p className="text-xs font-semibold text-content-main uppercase tracking-wider">
            {healthDef.label}
          </p>
        </div>
        <div
          className={`px-2.5 py-1 rounded-full border text-xs font-medium ${statusDef.style}`}
        >
          {statusDef.label}
        </div>
      </div>

      {/* 2. Contenido principal */}
      <div>
        <h3 className="text-lg font-bold text-content-main leading-tight mb-1">
          {project.title}
        </h3>
        <p
          className="text-sm text-content-muted line-clamp-2"
          title={project.description}
        >
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
            className={`${progressColor} h-full rounded-full transition-all duration-500 ease-out`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* 4. Métricas Clave (Usamos displayKpis que solo tiene 3) */}
      {displayKpis.length > 0 && (
        <div className="mt-2 pt-3 border-t border-dashed border-layout-border space-y-2.5">
          <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
            <Target className="w-3 h-3" /> Métricas Clave
          </p>

          {displayKpis.map((kpi) => {
            const isState = kpi.type === "STATUS";
            const isFinancial = kpi.type === "FINANCIAL";
            const isOverBudget = isFinancial && kpi.currentValue > kpi.target;

            const progressPercent =
              Math.min(100, (kpi.currentValue / kpi.target) * 100) || 0;

            return (
              <div key={kpi.id} className="text-xs">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-slate-600 truncate pr-2">
                    {kpi.name}
                  </span>
                  <span
                    className={`font-bold whitespace-nowrap ${isOverBudget ? "text-status-danger" : "text-slate-800"}`}
                  >
                    {isFinancial ? "$" : ""}
                    {Number(kpi.currentValue.toFixed(1))}{" "}
                    <span
                      className={`font-normal ${isOverBudget ? "text-red-400" : "text-slate-400"}`}
                    >
                      / {isFinancial ? "$" : ""}
                      {Math.round(kpi.target)} {kpi.unit}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                  {/* Si hay sobregiro, la barra se pinta de rojo. Si no, verde o azul */}
                  <div
                    className={`h-full transition-all duration-500 ${
                      isOverBudget
                        ? "bg-status-danger"
                        : isState
                          ? "bg-indigo-400"
                          : "bg-emerald-400"
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. Placas de Eficiencia / Ratios (Usamos allKpis que tiene la matemática completa) */}
      {project.ratios && project.ratios.length > 0 && (
        <div className="mt-4 space-y-2">
          {project.ratios.map((ratio) => {
            // 👉 LA MAGIA: Ahora buscamos en 'allKpis', garantizando que encontremos las variables
            const numValue = allKpis
              .filter((k) => ratio.numeratorNames?.includes(k.name))
              .reduce((sum, k) => sum + k.currentValue, 0);

            const denValue = allKpis
              .filter((k) => ratio.denominatorNames?.includes(k.name))
              .reduce((sum, k) => sum + k.currentValue, 0);

            let rawResult = denValue > 0 ? numValue / denValue : 0;

            if (ratio.unit.trim() === "%") {
              rawResult = rawResult * 100;
            }

            const finalResult = rawResult.toFixed(2);
            const isFinancial =
              ratio.unit.toLowerCase().includes("mxn") ||
              ratio.unit.toLowerCase().includes("usd") ||
              ratio.unit.includes("$");

            return (
              <div
                key={ratio.id}
                className="bg-slate-800 p-3 rounded-lg flex justify-between items-center shadow-inner"
              >
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider truncate pr-2">
                  {ratio.name}
                </span>
                <span className="text-lg font-black text-emerald-400 whitespace-nowrap">
                  {isFinancial && "$"}
                  {finalResult}{" "}
                  <span className="text-[10px] font-medium text-slate-400">
                    {ratio.unit}
                  </span>
                </span>
              </div>
            );
          })}
        </div>
      )}

      {/* 6. Pie de tarjeta */}
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
