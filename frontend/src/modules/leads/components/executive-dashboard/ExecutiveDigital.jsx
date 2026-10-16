import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { MonitorSmartphone, UserCheck, CalendarDays, Banknote } from 'lucide-react';
import { ExecutiveCard } from './ExecutiveCard';
import { getDigitalFunnel } from '../../services/leads.api';

export const ExecutiveDigital = ({ month }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getDigitalFunnel(month, "DIGITAL");
        setData(res.data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading || !data) return <div className="text-center py-20 text-slate-500">Cargando Toyota Digital...</div>;

  const funnelChartData = [
    { name: 'Leads', cantidad: data.leads },
    { name: 'Asignados', cantidad: data.asignados },
    { name: 'Citas', cantidad: data.citas },
    { name: 'Shows', cantidad: data.shows },
    { name: 'Ventas', cantidad: data.ventas },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExecutiveCard title="Leads Generados" value={data.leads} icon={MonitorSmartphone} colorClass="bg-gradient-to-br from-cyan-400 to-cyan-600" />
        <ExecutiveCard title="Asignados" value={data.asignados} icon={UserCheck} colorClass="bg-gradient-to-br from-indigo-400 to-indigo-600" subtitle={`${data.contactadosPercent}% Contactados`} />
        <ExecutiveCard title="Citas / Shows" value={`${data.citas} / ${data.shows}`} icon={CalendarDays} colorClass="bg-gradient-to-br from-violet-400 to-violet-600" />
        <ExecutiveCard title="Monto Generado" value={`$${(data.totalAmount || 0).toLocaleString()}`} subtitle={`${data.ventas} Ventas`} icon={Banknote} colorClass="bg-gradient-to-br from-emerald-500 to-emerald-700" />
      </div>

      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <h3 className="text-lg font-bold text-slate-800 mb-6">Funnel Toyota Digital</h3>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} />
              <YAxis axisLine={false} tickLine={false} />
              <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
              <Bar dataKey="cantidad" fill="#06B6D4" radius={[6, 6, 0, 0]} barSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};