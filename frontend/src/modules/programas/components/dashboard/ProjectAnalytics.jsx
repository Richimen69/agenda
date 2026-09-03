import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";
import { Target, TrendingUp, Award, BarChart3 } from "lucide-react";

export default function ProjectAnalytics({ project }) {
  // =========================================================
  // 🧠 MAGIA DE DATOS: TRANSFORMACIÓN PARA LAS GRÁFICAS
  // =========================================================
  const { chartData, totalMeta, totalReal, kpisEstado } = useMemo(() => {
    let tMeta = 0;
    let tReal = 0;
    const estadoKpis = [];

    // Mapeamos las tareas principales para la gráfica de barras
    const data = (project.actions || [])
      .map((action) => {
        let metaAcumulable = 0;
        let realAcumulable = 0;

        action.kpis?.forEach((kpi) => {
          if (kpi.type === "ACCUMULABLE") {
            metaAcumulable += kpi.target;
            realAcumulable += kpi.currentValue;
            tMeta += kpi.target;
            tReal += kpi.currentValue;
          } else if (kpi.type === "STATUS") {
            estadoKpis.push(kpi);
          }
        });

        return {
          name:
            action.title.length > 15
              ? action.title.substring(0, 15) + "..."
              : action.title,
          Meta: Math.round(metaAcumulable),
          Logrado: Math.round(realAcumulable),
          amt: 100, // Para estilos
        };
      })
      .filter((d) => d.Meta > 0); // Solo graficamos tareas que tengan metas numéricas

    return {
      chartData: data,
      totalMeta: tMeta,
      totalReal: tReal,
      kpisEstado: estadoKpis,
    };
  }, [project]);

  // =========================================================
  // RENDERIZADO VISUAL
  // =========================================================
  return (
    <div className="space-y-6 animate-fade-in">
      {/* 1. ROW DE RESUMEN EJECUTIVO (KPIs GLOBALES) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tarjeta de Recuperación Total (Basada en la imagen de Toyota) */}
        <div className="bg-slate-900 rounded-xl p-5 border border-slate-800 shadow-lg relative overflow-hidden">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-red-500/20 rounded-full blur-xl"></div>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
            <Target className="w-4 h-4 text-red-500" /> Total Recuperación
            (Unidades)
          </p>
          <div className="flex items-end gap-2">
            <span className="text-4xl font-black text-white">{totalReal}</span>
            <span className="text-lg font-medium text-slate-500 mb-1">
              / {totalMeta} mes
            </span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-red-500 h-full transition-all duration-1000"
              style={{
                width: `${Math.min(100, (totalReal / totalMeta) * 100 || 0)}%`,
              }}
            ></div>
          </div>
        </div>

        {/* Tarjetas de Ratios (Ej. Conversión 8%) */}
        {project.ratios?.map((ratio) => {
          const allKpis = project.actions?.flatMap((a) => a.kpis || []) || [];

          const numValue = allKpis
            .filter((k) => k && ratio.numeratorNames?.includes(k.name))
            .reduce((sum, k) => sum + k.currentValue, 0);

          const denValue = allKpis
            .filter((k) => k && ratio.denominatorNames?.includes(k.name))
            .reduce((sum, k) => sum + k.currentValue, 0);

          let result = denValue > 0 ? numValue / denValue : 0;
          if (ratio.unit?.trim() === "%") result = result * 100;

          return (
            <div
              key={ratio.id}
              className="bg-white rounded-xl p-5 border border-layout-border shadow-sm"
            >
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
                <TrendingUp className="w-4 h-4 text-brand" /> {ratio.name}
              </p>
              <div className="flex items-end gap-1">
                <span className="text-3xl font-black text-slate-800">
                  {result.toFixed(1)}
                </span>
                <span className="text-sm font-bold text-slate-400 mb-1">
                  {ratio.unit}
                </span>
              </div>
            </div>
          );
        })}

        {/* Tarjetas de Market Share (KPIs de Estado) */}
        {kpisEstado.slice(0, 1).map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white rounded-xl p-5 border border-layout-border shadow-sm"
          >
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mb-2">
              <Award className="w-4 h-4 text-emerald-500" /> {kpi.name}{" "}
              (Objetivo)
            </p>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-black text-slate-800">
                {kpi.currentValue}
              </span>
              <span className="text-sm font-bold text-slate-400 mb-1">
                / {kpi.target}
                {kpi.unit}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 2. EL GRÁFICO PRINCIPAL (Expected vs Actual por Iniciativa) */}
      {chartData.length > 0 && (
        <div className="bg-white rounded-xl border border-layout-border shadow-sm p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-slate-600" />
            <h3 className="font-bold text-slate-800">
              Rendimiento por Iniciativa (Meta vs Realidad)
            </h3>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <Tooltip
                  cursor={{ fill: "#f8fafc" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                />
                <Legend
                  iconType="circle"
                  wrapperStyle={{ paddingTop: "20px" }}
                />

                {/* Barra de Meta (Gris de fondo) */}
                <Bar
                  dataKey="Meta"
                  fill="#cbd5e1"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
                {/* Barra de Logro (Rojo Toyota) */}
                <Bar
                  dataKey="Logrado"
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}
