import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, PieChart, Pie, Cell } from 'recharts';

// --- 1. TARJETA KPI SÓLIDA ---
export const ColorCard = ({ title, value, icon: Icon, badgeN, badgeS, subtitle, colorClass, className = "" }) => {
  return (
    <div className={`rounded-xl p-5 text-white shadow-md flex flex-col justify-between ${colorClass} ${className}`}>
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs font-bold uppercase tracking-wider opacity-90">{title}</p>
        <div className="bg-white/10 p-2 rounded-full">
          {Icon && <Icon size={20} className="opacity-90" />}
        </div>
      </div>
      
      <h3 className="text-3xl font-bold tracking-tight mb-3">{value}</h3>
      
      <div>
        {badgeN !== undefined && badgeS !== undefined ? (
          <div className="inline-flex items-center text-[11px] font-bold gap-1 px-2.5 py-1 rounded-full bg-white/20">
            <span>{badgeN} N</span>
            <span className="opacity-50">|</span>
            <span>{badgeS} S</span>
          </div>
        ) : subtitle ? (
          <div className="inline-flex items-center text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/20">
            {subtitle}
          </div>
        ) : (
          <div className="h-6"></div> 
        )}
      </div>
    </div>
  );
};

// --- 2. TARJETA DE TIEMPO PROMEDIO ---
export const TimeAvgCard = ({ title, value, label, icon: Icon, className = "" }) => {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between ${className}`}>
      <div>
        <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-extrabold text-slate-800">{value} <span className="text-sm font-medium text-slate-500">{label}</span></h3>
      </div>
      <div className="p-3 rounded-full bg-orange-50 text-orange-500">
        {Icon && <Icon size={24} />}
      </div>
    </div>
  );
};

// --- 3. LISTA DE PROGRESO ---
export const ProgressListCard = ({ title, subtitle, highlightColorClass, data, emptyMessage = "Sin datos registrados", className = "" }) => {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full ${className}`}>
      <h3 className="text-[13px] font-bold text-slate-800 mb-4">
        {title} {subtitle && <span className={`${highlightColorClass} font-normal`}>{subtitle}</span>}
      </h3>
      
      {!data || data.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-2 my-auto">{emptyMessage}</p>
      ) : (
        <div className="space-y-1 flex-1">
          {data.map((item, i) => (
            <div key={i} className="mb-3 last:mb-0">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-slate-600 uppercase truncate pr-4">{item.label}</span>
                <span className={`text-[11px] font-bold text-slate-500`}>{item.percentage}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-sm overflow-hidden">
                <div 
                  className={`h-full ${highlightColorClass.replace('text-', 'bg-')}`} 
                  style={{ width: `${item.percentage}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// --- 4. GRÁFICA DE DONA ---
const DEFAULT_DONUT_COLORS = ['#6366F1', '#EC4899', '#8B5CF6', '#F59E0B', '#14B8A6', '#CBD5E1'];

export const DonutChartCard = ({ title, subtitle, badgeText, data, totalValue, totalLabel = "Total", colors = DEFAULT_DONUT_COLORS, emptyMessage = "Sin datos registrados", className = "" }) => {
  return (
    <div className={`bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col h-full ${className}`}>
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[13px] font-bold text-slate-800">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {badgeText && <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] font-bold rounded-md">{badgeText}</span>}
      </div>
      
      {!data || data.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4 my-auto">{emptyMessage}</p>
      ) : (
        <div className="flex flex-col xl:flex-row items-center gap-4 mt-auto">
          <div className="relative w-28 h-28 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} innerRadius={30} outerRadius={50} paddingAngle={2} dataKey="value" stroke="none">
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] text-slate-500 leading-tight">{totalLabel}</span>
              <span className="text-base font-black text-slate-800 leading-none my-0.5">{totalValue}</span>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            {data.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: colors[i % colors.length] }}></span>
                  <span className="text-slate-600 truncate uppercase">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800 shrink-0">{item.porcentaje}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// --- 5. EMBUDO DE BARRAS VERTICALES ---
export const FunnelBarChartCard = ({ title, data, bar1Key = "Nuevos", bar2Key = "Seminuevos", color1 = "#3B82F6", color2 = "#10B981", className = "" }) => {
  return (
    <div className={`bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col min-h-[500px] ${className}`}>
      <h3 className="text-sm font-bold text-slate-800 mb-8">{title}</h3>
      <div className="flex-1 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
            
            <Bar dataKey={bar1Key} fill={color1} radius={[2, 2, 0, 0]} barSize={35}>
              <LabelList dataKey={bar1Key} position="top" fill="#64748B" fontSize={11} formatter={(val) => val > 0 ? val : ''} />
            </Bar>
            {bar2Key && (
              <Bar dataKey={bar2Key} fill={color2} radius={[2, 2, 0, 0]} barSize={35}>
                <LabelList dataKey={bar2Key} position="top" fill="#64748B" fontSize={11} formatter={(val) => val > 0 ? val : ''} />
              </Bar>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};