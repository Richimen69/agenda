import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Wrench, CalendarCheck, FileText, Banknote } from 'lucide-react';
import { ExecutiveCard } from './ExecutiveCard';
import { getDigitalFunnel, getLeadCount } from '../../services/leads.api';

const COLORS = ['#F43F5E', '#14B8A6'];

export const ExecutivePostVenta = ({ month }) => {
  const [data, setData] = useState(null);
  const [leadsByArea, setLeadsByArea] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [funnelRes, countRes] = await Promise.all([
          getDigitalFunnel(month, "SERVICIO,REFACCIONES"),
          getLeadCount(month)
        ]);
        
        setData(funnelRes.data);
        const filteredAreas = (countRes.data?.leadsByDepartment || []).filter(
          item => ['SERVICIO', 'REFACCIONES'].includes(item.department)
        );
        setLeadsByArea(filteredAreas);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading || !data) return <div className="text-center py-20 text-slate-500">Cargando Área Post Venta...</div>;

  const funnelChartData = [
    { name: 'Leads', cantidad: data.leads },
    { name: 'Citas', cantidad: data.citas },
    { name: 'Shows', cantidad: data.shows },
    { name: 'Cotización', cantidad: data.cotizacion },
    { name: 'Ventas', cantidad: data.ventas },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <ExecutiveCard title="Leads (Servicio y Refacciones)" value={data.leads} icon={Wrench} colorClass="bg-gradient-to-br from-rose-400 to-rose-600" />
        <ExecutiveCard title="Citas / Shows" value={`${data.citas} / ${data.shows}`} icon={CalendarCheck} colorClass="bg-gradient-to-br from-teal-400 to-teal-600" />
        <ExecutiveCard title="Cotizaciones" value={data.cotizacion} icon={FileText} colorClass="bg-gradient-to-br from-amber-400 to-amber-600" />
        <ExecutiveCard title="Monto Generado" value={`$${(data.totalAmount || 0).toLocaleString()}`} subtitle={`${data.ventas} Ventas totales`} icon={Banknote} colorClass="bg-gradient-to-br from-indigo-500 to-indigo-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
           <h3 className="text-lg font-bold text-slate-800 mb-6">Desempeño Post Venta</h3>
           <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelChartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '12px', border: 'none'}} />
                <Bar dataKey="cantidad" fill="#F43F5E" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center">
            <h3 className="text-md font-bold text-slate-800 mb-2 text-center">Leads por Área</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={leadsByArea} dataKey="count" nameKey="department" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5}>
                    {leadsByArea.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
        </div>
      </div>
    </div>
  );
};