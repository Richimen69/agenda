import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Users,
  Calendar,
  AlignLeft,
  CheckSquare,
  MessageSquare,
} from "lucide-react";
import { getProjectDetails, getActionTree } from "../services/projects.api";
import CreateActionModal from "../components/CreateActionModal";

export default function ProjectDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [actionTree, setActionTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);

  const refreshTree = async () => {
    const treeData = await getActionTree(id);
    setActionTree(treeData);
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectData, treeData] = await Promise.all([
          getProjectDetails(id),
          getActionTree(id),
        ]);
        setProject(projectData);
        setActionTree(treeData);
      } catch (error) {
        console.error("Error cargando proyecto:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading)
    return (
      <div className="p-8 text-center text-content-muted">
        Cargando proyecto...
      </div>
    );
  if (!project)
    return (
      <div className="p-8 text-center text-status-danger">
        Proyecto no encontrado.
      </div>
    );

  // Lógica de separación de equipo
  const owner = project.members?.find((m) => m.roleType === "OWNER");
  const team = project.members?.filter((m) => m.roleType !== "OWNER") || [];

  return (
    <div className="min-h-screen bg-[#f3f4f6] p-6 text-content-main font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* ================= HEADER ================= */}
        <header className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-layout-border">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 border border-layout-border rounded-lg hover:bg-layout-hover text-content-muted transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 leading-tight">
                {project.title}
              </h1>
              <span className="text-xs font-mono text-content-muted bg-layout-surface px-2 py-0.5 rounded border border-layout-border">
                #proj-{project.id.split("-")[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-content-muted uppercase">
              ESTADO
            </span>
            <select
              value={project.status}
              className="bg-orange-50 border border-orange-100 text-orange-800 text-sm font-bold rounded-md px-3 py-1.5 outline-none cursor-pointer"
              readOnly
            >
              <option value="NEW">NUEVO</option>
              <option value="IN_PROGRESS">EN PROGRESO</option>
              <option value="REVIEW">REVISIÓN</option>
              <option value="COMPLETED">COMPLETADO</option>
            </select>
          </div>
        </header>

        {/* ================= CUERPO PRINCIPAL (GRID) ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* COLUMNA IZQUIERDA (Ancha) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tarjetas de Equipo (Owner vs Support) */}
            <div className="grid grid-cols-2 gap-4">
              {/* Propietario */}
              <div className="bg-white p-4 rounded-xl border border-layout-border shadow-sm flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-layout-border rounded-lg text-content-muted">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                    PROPIETARIO (LÍDER)
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-bold">
                      {owner?.user.name.charAt(0) || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {owner?.user.name || "Sin asignar"}
                      </p>
                      <p className="text-xs text-content-muted">
                        {owner?.businessRole || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Equipo Asignado */}
              <div className="bg-white p-4 rounded-xl border border-layout-border shadow-sm flex items-start gap-3">
                <div className="p-2 bg-slate-50 border border-layout-border rounded-lg text-content-muted">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-content-muted uppercase tracking-wider mb-1">
                    EQUIPO ASIGNADO
                  </p>
                  <div className="flex items-center gap-2 flex-wrap">
                    {team.length > 0 ? (
                      team.map((member) => (
                        <div
                          key={member.id}
                          className="flex items-center gap-1.5 bg-layout-surface border border-layout-border px-2 py-1 rounded-md"
                        >
                          <div className="w-5 h-5 rounded-full bg-slate-600 text-white flex items-center justify-center text-[10px] font-bold">
                            {member.user.name.charAt(0)}
                          </div>
                          <span className="text-xs font-medium text-slate-700">
                            {member.user.name.split(" ")[0]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <span className="text-sm text-content-muted">
                        Sin equipo de apoyo
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Detalles (Descripción) */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm overflow-hidden">
              <div className="bg-slate-50 px-4 py-3 border-b border-layout-border flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-content-muted" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Detalles adicionales
                </h3>
              </div>
              <div className="p-4 text-sm text-slate-600 whitespace-pre-wrap">
                {project.description || "Sin descripción detallada."}
              </div>
            </div>

            {/* Árbol de Tareas Estratégicas (WBS) */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-layout-border flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-4 h-4 text-content-muted" />
                  <h3 className="font-bold text-slate-800 text-sm">
                    Estructura de Tareas (WBS)
                  </h3>
                </div>
                <button
                  onClick={() => setIsActionModalOpen(true)} // <-- ACTIVA EL MODAL
                  className="text-brand text-xs font-bold hover:bg-brand-subtle px-2 py-1 rounded transition-colors flex items-center gap-1"
                >
                  + Agregar Tarea Raíz
                </button>
              </div>

              <div className="p-4 space-y-3">
                {actionTree.length === 0 ? (
                  <div className="text-center py-6 text-sm text-content-muted bg-layout-surface rounded border border-dashed border-layout-border">
                    El proyecto no tiene tareas definidas aún.
                  </div>
                ) : (
                  actionTree.map((action) => (
                    <ActionNode key={action.id} action={action} />
                  ))
                )}
              </div>
            </div>

            {/* Bitácora Mock (Para mantener tu diseño) */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-layout-border flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-content-muted" />
                <h3 className="font-bold text-slate-800 text-sm">
                  Bitácora de Seguimiento
                </h3>
              </div>
              <div className="p-4 flex flex-col items-center justify-center py-8 text-content-muted">
                <p className="text-sm">
                  La bitácora de proyecto se conectará aquí.
                </p>
              </div>
            </div>
          </div>

          {/* COLUMNA DERECHA (Sidebar) */}
          <div className="space-y-6">
            {/* Tarjeta de Progreso y Salud (NUEVO PARA PPM) */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm p-5">
              <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">
                Métricas Estratégicas
              </h3>

              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Avance Global
                </span>
                <span className="text-3xl font-black text-brand">
                  {project.globalProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mb-6">
                <div
                  className="bg-brand h-full transition-all duration-1000"
                  style={{ width: `${project.globalProgress}%` }}
                ></div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <span className="text-sm font-semibold text-slate-700">
                  Salud del Proyecto
                </span>
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    project.health === "GREEN"
                      ? "bg-green-100 text-green-800"
                      : project.health === "YELLOW"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {project.health === "GREEN"
                    ? "A TIEMPO"
                    : project.health === "YELLOW"
                      ? "EN RIESGO"
                      : "ATRASADO"}
                </span>
              </div>
            </div>

            {/* Tarjeta de Propiedades Clásicas */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm">
              <div className="px-4 py-3 border-b border-layout-border">
                <h3 className="font-bold text-slate-800 text-sm">
                  Propiedades
                </h3>
              </div>
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-content-muted font-medium uppercase text-xs">
                    FECHA LÍMITE
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.targetDate).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
                <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-50">
                  <span className="text-content-muted font-medium uppercase text-xs">
                    FECHA INICIO
                  </span>
                  <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                    <Calendar className="w-4 h-4" />
                    {new Date(project.createdAt).toLocaleDateString("es-ES", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CreateActionModal
        isOpen={isActionModalOpen}
        onClose={() => setIsActionModalOpen(false)}
        projectId={id}
        members={project.members}
        onSuccess={refreshTree}
      />
    </div>
  );
}

// Componente del Árbol (Diseño adaptado a tu checklist)
function ActionNode({ action, depth = 0 }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = action.children && action.children.length > 0;

  return (
    <div
      className={`rounded-lg overflow-hidden border ${depth === 0 ? "border-layout-border" : "border-l-2 border-brand/30 border-y-0 border-r-0 rounded-none ml-4 mt-2"}`}
    >
      <div
        className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 rounded border flex items-center justify-center ${action.progress === 100 ? "bg-green-500 border-green-500" : "border-slate-300 bg-slate-50"}`}
          >
            {action.progress === 100 && (
              <span className="text-white text-[10px]">✓</span>
            )}
          </div>
          <div>
            <span
              className={`font-semibold text-sm ${action.progress === 100 ? "text-slate-400 line-through" : "text-slate-700"}`}
            >
              {action.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-bold text-brand bg-brand-subtle px-1.5 py-0.5 rounded">
                Avance: {action.progress}%
              </span>
              <span className="text-[10px] text-content-muted">
                Resp: {action.owner?.name || "Sin asignar"}
              </span>
            </div>
          </div>
        </div>
        {hasChildren && (
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
            {action.children.length} subtareas
          </span>
        )}
      </div>

      {expanded && hasChildren && (
        <div className="p-2 bg-slate-50/50">
          {action.children.map((child) => (
            <ActionNode key={child.id} action={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
