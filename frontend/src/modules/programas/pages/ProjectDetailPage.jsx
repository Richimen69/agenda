import { act, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User as UserIcon,
  Users,
  Calendar,
  AlignLeft,
  CheckSquare,
  MessageSquare,
  CircleAlert,
} from "lucide-react";
import {
  getProjectDetails,
  getActionTree,
  addProjectComment,
} from "../services/projects.api";
import CreateActionModal from "../components/CreateActionModal";
import CreateRatioModal from "../components/CreateRatioModal";

export default function ProjectDetailPage({ creatorId }) {
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [actionTree, setActionTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [isRatioModalOpen, setIsRatioModalOpen] = useState(false);
  const daysRemaining = Math.ceil(
    (new Date(project?.targetDate) - new Date()) / (1000 * 60 * 60 * 24),
  );

  const handleSendComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    try {
      const commentData = await addProjectComment(id, {
        text: newComment,
        userId: creatorId,
      });
      setProject((prev) => ({
        ...prev,
        projectComments: [...(prev.projectComments || []), commentData],
      }));

      setNewComment("");
    } catch (error) {
      alert("Error al enviar comentario");
    } finally {
      setIsCommenting(false);
    }
  };
  const financialKpis = actionTree
    .flatMap((a) => a.kpis || [])
    .filter((k) => k.type === "FINANCIAL");
  const totalBudget = financialKpis.reduce((sum, k) => sum + k.target, 0);
  const consumedBudget = financialKpis.reduce(
    (sum, k) => sum + k.currentValue,
    0,
  );
  const getInitials = (name) =>
    name
      ? name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .substring(0, 2)
          .toUpperCase()
      : "UN";
  const budgetPercent =
    totalBudget > 0 ? (consumedBudget / totalBudget) * 100 : 0;
  const budgetAlert = consumedBudget > totalBudget;
  const isOverdue = daysRemaining < 0;
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
  const getUniqueKpiNames = () => {
    const names = new Set();
    const traverse = (actions) => {
      actions.forEach((action) => {
        action.kpis?.forEach((kpi) => names.add(kpi.name));
        if (action.children) traverse(action.children);
      });
    };
    traverse(actionTree);
    return Array.from(names);
  };
  const uniqueKpiNames = getUniqueKpiNames();

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
              className="p-2 border border-layout-border rounded-lg hover:bg-layout-hover text-content-muted transition-colors cursor-pointer"
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
                    Estructura de Tareas
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
            <div className="bg-white rounded-xl border border-layout-border shadow-sm overflow-hidden flex flex-col h-[500px]">
              {/* Cabecera Bitácora */}
              <div className="px-5 py-4 border-b border-layout-border">
                <h3 className="font-bold text-slate-800 text-sm tracking-tight uppercase">
                  Bitácora de Seguimiento (
                  {project.projectComments?.length || 0})
                </h3>
                <p className="text-xs text-content-muted mt-0.5">
                  Soporte y discusiones estratégicas del equipo
                </p>
              </div>

              {/* Área de Mensajes (Chat) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/50 custom-scrollbar">
                {project.projectComments?.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-content-muted">
                    No hay comentarios aún. Escribe el primer mensaje para el
                    equipo.
                  </div>
                ) : (
                  project.projectComments?.map((comment) => {
                    const isMe = comment.userId === creatorId;

                    return (
                      <div
                        key={comment.id}
                        className={`flex w-full ${isMe ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`flex gap-3 max-w-[80%] ${isMe ? "flex-row-reverse" : "flex-row"}`}
                        >
                          {/* Avatar */}
                          <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white mt-1 shadow-sm
                ${isMe ? "bg-brand" : "bg-slate-700"}`}
                          >
                            {getInitials(comment.user.name)}
                          </div>

                          {/* Burbuja y Metadatos */}
                          <div
                            className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                          >
                            <div className="flex items-baseline gap-2 mb-1 px-1">
                              <span className="text-xs font-bold text-slate-700">
                                {isMe ? "Tú" : comment.user.name.split(" ")[0]}
                              </span>
                              <span className="text-[10px] text-content-muted">
                                {new Date(
                                  comment.createdAt,
                                ).toLocaleDateString()}{" "}
                                a las{" "}
                                {new Date(comment.createdAt).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </span>
                            </div>

                            <div
                              className={`px-4 py-2.5 rounded-2xl text-sm shadow-sm
                  ${
                    isMe
                      ? "bg-brand-subtle/20 border border-brand/20 text-slate-800 rounded-tr-sm"
                      : "bg-white border border-layout-border text-slate-800 rounded-tl-sm"
                  }`}
                            >
                              {comment.text}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input de Envío */}
              <form
                onSubmit={handleSendComment}
                className="p-4 border-t border-layout-border bg-white flex gap-3"
              >
                <input
                  type="text"
                  placeholder="Escribe un comentario o actualización..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1 bg-layout-surface border border-layout-border rounded-lg px-4 py-2 text-sm focus:ring-1 focus:ring-brand outline-none"
                />
                <button
                  type="submit"
                  disabled={isCommenting || !newComment.trim()}
                  className="bg-brand text-white w-10 h-10 rounded-lg flex items-center justify-center hover:bg-brand-hover transition-colors disabled:opacity-50 shrink-0"
                >
                  {/* Icono de Enviar (Avioncito de papel) */}
                  <svg
                    className="w-5 h-5 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </form>
            </div>
          </div>

          {/* COLUMNA DERECHA (Sidebar) */}
          <div className="space-y-6">
            {/* Tarjeta de Progreso y Salud (NUEVO PARA PPM) */}
            <div className="bg-white rounded-xl border border-layout-border shadow-sm p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider">
                  Métricas Derivadas
                </h3>
                <button
                  onClick={() => setIsRatioModalOpen(true)}
                  className="text-[10px] font-bold text-brand bg-brand-subtle px-2 py-1 rounded hover:opacity-80"
                >
                  + Configurar
                </button>
              </div>

              {project.ratios?.length > 0 ? (
                <div className="space-y-2">
                  {project.ratios.map((ratio) => (
                    <div
                      key={ratio.id}
                      className="p-2 border border-layout-border rounded bg-slate-50 text-xs"
                    >
                      <strong className="block text-slate-700">
                        {ratio.name}
                      </strong>
                      <span className="text-slate-500">
                        [{ratio.numeratorNames}] ÷ [{ratio.denominatorNames}]
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-content-muted text-center py-2">
                  No hay métricas calculadas.
                </p>
              )}
            </div>

            <div className="bg-white rounded-xl border border-layout-border shadow-sm p-5">
              <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-4">
                Métricas Estratégicas
              </h3>

              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-semibold text-slate-700">
                  Avance Global
                </span>
                <span
                  className={`transition-all duration-1000 text-3xl font-black ${project.health === "GREEN" ? "text-emerald-600" : project.health === "YELLOW" ? "text-amber-400" : "text-rose-500"}`}
                >
                  {project.globalProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden mb-6">
                <div
                  className={`h-full transition-all duration-1000 ${
                    project.health === "GREEN"
                      ? "bg-emerald-500"
                      : project.health === "YELLOW"
                        ? "bg-amber-400"
                        : "bg-rose-500"
                  }`}
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

            <div className="bg-white rounded-xl border border-layout-border shadow-sm p-5">
              <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider mb-2">
                Línea de Tiempo
              </h3>
              <div className="flex items-center gap-3">
                <div
                  className={`p-3 rounded-lg ${isOverdue ? "bg-red-50 text-red-600" : "bg-blue-50 text-blue-600"}`}
                >
                  <Calendar className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-black text-slate-800">
                    {Math.abs(daysRemaining)}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      días
                    </span>
                  </p>
                  <p
                    className={`text-xs font-bold ${isOverdue ? "text-red-500" : "text-slate-400"}`}
                  >
                    {isOverdue ? "DE RETRASO" : "RESTANTES"}
                  </p>
                </div>
              </div>
            </div>

            {totalBudget > 0 && (
              <div
                className={`bg-white rounded-xl border shadow-sm p-5 ${budgetAlert ? "border-red-300 bg-red-50/30" : "border-layout-border"}`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-bold text-content-muted uppercase tracking-wider">
                    Salud Financiera
                  </h3>
                  {budgetAlert && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full animate-pulse">
                      <CircleAlert className="w-3 h-3" /> SOBREGIRO
                    </span>
                  )}
                </div>

                <div className="flex justify-between items-end mb-2">
                  <span className="text-sm font-semibold text-slate-700">
                    Consumido
                  </span>
                  <span
                    className={`text-xl font-black ${budgetAlert ? "text-red-600" : "text-slate-800"}`}
                  >
                    ${consumedBudget.toLocaleString('es-MX')}{" "}
                    <span className="text-sm font-medium text-slate-500">
                      / ${totalBudget.toLocaleString('es-MX')}
                    </span>
                  </span>
                </div>
                <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${budgetAlert ? "bg-red-500" : "bg-emerald-500"}`}
                    style={{ width: `${Math.min(100, budgetPercent)}%` }}
                  ></div>
                </div>
              </div>
            )}

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
        creatorId={creatorId}
        titleMain={project.title}
      />
      <CreateRatioModal
        isOpen={isRatioModalOpen}
        onClose={() => setIsRatioModalOpen(false)}
        projectId={id}
        availableKpis={uniqueKpiNames}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

function ActionNode({ action, depth = 0 }) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const financialKpi = action.kpis?.find((k) => k.type === "FINANCIAL");
  const isPurelyFinancial = action.kpis?.length === 1 && financialKpi;
  const hasChildren = action.children && action.children.length > 0;
  const handleNodeClick = () => {
    if (hasChildren) {
      setExpanded(!expanded);
    } else if (action.subtask?.ticketId) {
      navigate(`/tickets/${action.subtask.ticketId}`);
    }
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border ${
        depth === 0
          ? "border-layout-border"
          : "border-l-2 border-brand/30 border-y-0 border-r-0 rounded-none ml-4 mt-2"
      }`}
    >
      <div
        className="flex items-center justify-between p-3 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        onClick={handleNodeClick}
      >
        <div className="flex items-center gap-3">
          <div>
            <span
              className={`font-semibold text-sm ${
                action.progress === 100
                  ? "text-slate-400 line-through"
                  : "text-slate-700"
              }`}
            >
              {action.title}
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              {isPurelyFinancial ? (
                // Si es puro dinero, pintamos la etiqueta verde/roja con dólares
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${financialKpi.currentValue > financialKpi.target ? "bg-red-100 text-red-700" : "bg-emerald-100 text-emerald-700"}`}
                >
                  ${financialKpi.currentValue.toLocaleString('es-MX')} / $
                  {financialKpi.target.toLocaleString('es-MX')} {financialKpi.unit}
                </span>
              ) : (
                // Si es operativa, pintamos el porcentaje normal
                <span className="text-[10px] font-bold text-brand bg-brand-subtle px-1.5 py-0.5 rounded">
                  Avance: {action.progress}%
                </span>
              )}
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
