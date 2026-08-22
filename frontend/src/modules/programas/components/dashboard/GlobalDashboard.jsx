import { useState, useEffect } from "react";
import { Link } from "react-router-dom"; // Asumiendo React Router
import {
  Briefcase,
  Activity,
  DollarSign,
  AlertOctagon,
  ArrowRight,
  TrendingUp,
  Clock,
} from "lucide-react";
import { getGlobalDashboardData } from "../../services/projects.api";

export default function GlobalDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const dashboardData = await getGlobalDashboardData();
        console.log(dashboardData)
        setData(dashboardData);
      } catch (error) {
        console.error("Error al cargar el dashboard global:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-500">
        Cargando telemetría global...
      </div>
    );
  }

  // Formateador de moneda
  const formatMoney = (amount) =>
    new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(amount);

  if (!data || data.globalMetrics.totalProjects === 0) {
    return null
  }
  const { globalMetrics, healthDistribution, criticalAttention } = data;
  const totalHealth =
    healthDistribution.GREEN +
    healthDistribution.YELLOW +
    healthDistribution.RED;
  const greenPct = (healthDistribution.GREEN / totalHealth) * 100;
  const yellowPct = (healthDistribution.YELLOW / totalHealth) * 100;
  const redPct = (healthDistribution.RED / totalHealth) * 100;
  return (
    <div className="px-8 pt-8 font-sans">
      <div className="mx-auto space-y-8">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Proyectos
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
              Corte Operativo
            </p>
            <p className="text-sm font-semibold text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm">
              {new Date().toLocaleDateString("es-MX", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </header>

        {/* ================= FILA 1: KPIs DE ALTO IMPACTO ================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta 1: Proyectos y Avance */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Volumen Operativo
                </p>
                <h3 className="text-3xl font-black text-slate-800">
                  {globalMetrics.totalProjects}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    Proyectos Activos
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Briefcase className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-semibold text-slate-700 flex items-center gap-1">
                  <Activity className="w-4 h-4 text-blue-500" /> Avance Promedio
                </span>
                <span className="text-sm font-bold text-blue-600">
                  {globalMetrics.overallCompanyProgress}%
                </span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-blue-500 h-full rounded-full"
                  style={{ width: `${globalMetrics.overallCompanyProgress}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Tarjeta 2: Salud del Portafolio (Gráfica Nativa de Tailwind) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Salud del Portafolio
                </p>
                <h3 className="text-3xl font-black text-slate-800">
                  {healthDistribution.GREEN}{" "}
                  <span className="text-sm font-medium text-slate-500">
                    Óptimos
                  </span>
                </h3>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100">
              <div className="w-full flex h-3 rounded-full overflow-hidden mb-3 bg-slate-100">
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{ width: `${greenPct}%` }}
                  title="Óptimo"
                ></div>
                <div
                  className="bg-amber-400 h-full transition-all"
                  style={{ width: `${yellowPct}%` }}
                  title="En Riesgo"
                ></div>
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{ width: `${redPct}%` }}
                  title="Atrasado"
                ></div>
              </div>
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-emerald-600 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>{" "}
                  Óptimo ({healthDistribution.GREEN})
                </span>
                <span className="text-amber-600 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-amber-400"></div>{" "}
                  Riesgo ({healthDistribution.YELLOW})
                </span>
                <span className="text-rose-600 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-rose-500"></div>{" "}
                  Crítico ({healthDistribution.RED})
                </span>
              </div>
            </div>
          </div>

          {/* Tarjeta 3: Finanzas Corporativas */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col justify-between relative overflow-hidden">
            {/* Decoración de fondo para que se vea premium */}
            <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl"></div>

            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Gasto Corporativo
                </p>
                <h3 className="text-3xl font-black text-white">
                  {formatMoney(globalMetrics.consumedBudget)}
                </h3>
              </div>
              <div className="p-3 bg-slate-800 text-emerald-400 rounded-xl">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50 relative z-10">
              <div className="flex justify-between items-center mb-2 text-sm font-semibold">
                <span className="text-slate-300">Presupuesto Aprobado</span>
                <span className="text-emerald-400">
                  {formatMoney(globalMetrics.totalBudget)}
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{
                    width: `${(globalMetrics.consumedBudget / globalMetrics.totalBudget) * 100}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= FILA 2: TABLA DE ATENCIÓN CRÍTICA ================= */}
        {criticalAttention.length > 0 && (
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm overflow-hidden">
            <div className="bg-rose-50 border-b border-red-100 px-6 py-4 flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600" />
              <h2 className="text-sm font-bold text-rose-800 uppercase tracking-wider">
                Proyectos Críticos Requieren Atención (Top{" "}
                {criticalAttention.length})
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-500 uppercase tracking-wider">
                    <th className="px-6 py-4">Proyecto</th>
                    <th className="px-6 py-4">Líder (Owner)</th>
                    <th className="px-6 py-4">Avance</th>
                    <th className="px-6 py-4">Fecha Meta</th>
                    <th className="px-6 py-4 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {criticalAttention.map((project) => {
                    const ownerName =
                      project.members[0]?.user?.name || "Sin Líder";

                    // Calculamos los días de atraso
                    const targetDate = new Date(project.targetDate);
                    const today = new Date();
                    const diffTime = today - targetDate;
                    const daysOverdue = Math.ceil(
                      diffTime / (1000 * 60 * 60 * 24),
                    );

                    return (
                      <tr
                        key={project.id}
                        className="hover:bg-slate-50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <p className="text-sm font-bold text-slate-800">
                            {project.title}
                          </p>
                          <p className="text-xs text-rose-600 font-semibold mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Atrasado por{" "}
                            {daysOverdue} días
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold">
                              {ownerName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-slate-700">
                              {ownerName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-slate-200 h-1.5 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full"
                                style={{ width: `${project.globalProgress}%` }}
                              ></div>
                            </div>
                            <span className="text-xs font-bold text-slate-700">
                              {project.globalProgress}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600 font-medium">
                            {targetDate.toLocaleDateString("es-MX", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            to={`/proyectos/${project.id}`}
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Revisar Proyecto <ArrowRight className="w-4 h-4" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
