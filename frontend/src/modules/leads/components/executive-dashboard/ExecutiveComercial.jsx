import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  CalendarDays,
  CarFront,
  Banknote,
  Clock,
} from "lucide-react";
import {
  getDigitalFunnel,
  getInterestResults,
  getCampaignResults,
} from "../../services/leads.api";
import {
  ColorCard,
  TimeAvgCard,
  ProgressListCard,
  DonutChartCard,
  FunnelBarChartCard,
} from "./ExecutiveWidgets";

export const ExecutiveComercial = ({ month }) => {
  const [dataNuevos, setDataNuevos] = useState(null);
  const [dataSeminuevos, setDataSeminuevos] = useState(null);
  const [topInterestsNuevos, setTopInterestsNuevos] = useState([]);
  const [topInterestsSeminuevos, setTopInterestsSeminuevos] = useState([]);
  const [donutData, setDonutData] = useState([]);
  const [totalCampanasLeads, setTotalCampanasLeads] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          nuevosRes,
          seminuevosRes,
          intNuevosRes,
          intSemiRes,
          campaignsRes,
        ] = await Promise.all([
          getDigitalFunnel(month, "NUEVOS"),
          getDigitalFunnel(month, "SEMINUEVOS"),
          getInterestResults(month, "NUEVOS"),
          getInterestResults(month, "SEMINUEVOS"),
          getCampaignResults(month, "NUEVOS,SEMINUEVOS"),
        ]);

        setDataNuevos(nuevosRes.data);
        setDataSeminuevos(seminuevosRes.data);

        // Mapear Top Nuevos
        const totalIntNuevos = (intNuevosRes.data || []).reduce(
          (acc, item) => acc + item.leads,
          0,
        );
        setTopInterestsNuevos(
          (intNuevosRes.data || []).slice(0, 5).map((item) => ({
            label: item.vehicle,
            percentage:
              totalIntNuevos > 0
                ? ((item.leads / totalIntNuevos) * 100).toFixed(1)
                : 0,
          })),
        );

        // Mapear Top Seminuevos
        const totalIntSemi = (intSemiRes.data || []).reduce(
          (acc, item) => acc + item.leads,
          0,
        );
        setTopInterestsSeminuevos(
          (intSemiRes.data || []).slice(0, 5).map((item) => ({
            label: item.vehicle,
            percentage:
              totalIntSemi > 0
                ? ((item.leads / totalIntSemi) * 100).toFixed(1)
                : 0,
          })),
        );

        // Procesar Campañas para la Dona
        const allCampaigns = campaignsRes.data || [];
        const totalCampaigns = allCampaigns.reduce(
          (acc, item) => acc + item.leads,
          0,
        );
        setTotalCampanasLeads(totalCampaigns);

        const top5Camps = allCampaigns.slice(0, 5);
        const top5Leads = top5Camps.reduce((acc, item) => acc + item.leads, 0);
        const othersLeads = totalCampaigns - top5Leads;

        let formattedDonutData = top5Camps.map((item) => ({
          name: item.campaign,
          value: item.leads,
          porcentaje:
            totalCampaigns > 0
              ? ((item.leads / totalCampaigns) * 100).toFixed(1)
              : 0,
        }));

        if (othersLeads > 0) {
          formattedDonutData.push({
            name: "OTROS",
            value: othersLeads,
            porcentaje:
              totalCampaigns > 0
                ? ((othersLeads / totalCampaigns) * 100).toFixed(1)
                : 0,
          });
        }
        setDonutData(formattedDonutData);
      } catch (error) {
        console.error("Error cargando métricas:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [month]);

  if (loading || !dataNuevos || !dataSeminuevos) {
    return (
      <div className="text-center py-20 text-slate-500">
        Cargando Rendimiento Comercial...
      </div>
    );
  }

  // Cálculos Totales
  const totalLeads = dataNuevos.leads + dataSeminuevos.leads;
  const totalAsignados = dataNuevos.asignados + dataSeminuevos.asignados;
  const totalCitas = dataNuevos.citas + dataSeminuevos.citas;
  const totalShows = dataNuevos.shows + dataSeminuevos.shows;
  const totalVentas = dataNuevos.ventas + dataSeminuevos.ventas;
  const totalAmount =
    (dataNuevos.totalAmount || 0) + (dataSeminuevos.totalAmount || 0);

  // Cálculo del tiempo promedio
  const avgNuevos = dataNuevos.avgContactTime || 0;
  const avgSeminuevos = dataSeminuevos.avgContactTime || 0;
  const avgTotalContactTime = (
    (avgNuevos + avgSeminuevos) /
    (avgNuevos > 0 && avgSeminuevos > 0 ? 2 : 1)
  ).toFixed(0);

  // Estructura para el BarChart Vertical
  const funnelPorAreaData = [
    {
      name: "Leads",
      Nuevos: dataNuevos.leads,
      Seminuevos: dataSeminuevos.leads,
    },
    {
      name: "Asignados",
      Nuevos: dataNuevos.asignados,
      Seminuevos: dataSeminuevos.asignados,
    },
    {
      name: "Citas",
      Nuevos: dataNuevos.citas,
      Seminuevos: dataSeminuevos.citas,
    },
    {
      name: "Shows",
      Nuevos: dataNuevos.shows,
      Seminuevos: dataSeminuevos.shows,
    },
    {
      name: "Ventas",
      Nuevos: dataNuevos.ventas,
      Seminuevos: dataSeminuevos.ventas,
    },
  ];

  const formatCurrency = (amount) =>
    amount.toLocaleString("es-MX", {
      style: "currency",
      currency: "MXN",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div className="space-y-6">
      {/* 5 Tarjetas Superiores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <ColorCard
          title="Total Leads"
          value={totalLeads}
          icon={Users}
          colorClass="bg-[#1E293B]"
        />
        <ColorCard
          title="Asignados"
          value={totalAsignados}
          icon={UserCheck}
          badgeN={dataNuevos.asignados}
          badgeS={dataSeminuevos.asignados}
          colorClass="bg-[#10B981]"
        />
        <ColorCard
          title="Citas"
          value={totalCitas}
          icon={CalendarDays}
          badgeN={dataNuevos.citas}
          badgeS={dataSeminuevos.citas}
          colorClass="bg-[#3B82F6]"
        />
        <ColorCard
          title="Shows"
          value={totalShows}
          icon={CarFront}
          badgeN={dataNuevos.shows}
          badgeS={dataSeminuevos.shows}
          colorClass="bg-[#F97316]"
        />
        <ColorCard
          title="Monto Generado"
          value={formatCurrency(totalAmount)}
          icon={Banknote}
          subtitle={`${totalVentas} Ventas totales`}
          colorClass="bg-[#6366F1]"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Gráfica de Barras Verticales */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <FunnelBarChartCard
            title="Embudo: Nuevos vs Seminuevos"
            data={funnelPorAreaData}
            bar1Key="Nuevos"
            bar2Key="Seminuevos"
            color1="#3B82F6"
            color2="#10B981"
          />

          <DonutChartCard
            title="Top Canales de Adquisición"
            subtitle="Origen de los prospectos digitales captados"
            badgeText="General"
            totalValue={totalCampanasLeads}
            totalLabel="Total"
            data={donutData}
          />
        </div>

        {/* Columna Derecha: Tarjeta de Tiempo, Top 5s y Dona */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <TimeAvgCard
            title="Tiempo de Respuesta"
            value={avgTotalContactTime}
            label="minutos"
            icon={Clock}
          />

          <ProgressListCard
            title="Top 5 Vehículos:"
            subtitle="Nuevos"
            highlightColorClass="text-[#3B82F6]"
            data={topInterestsNuevos}
          />

          <ProgressListCard
            title="Top 5 Vehículos:"
            subtitle="Seminuevos"
            highlightColorClass="text-[#10B981]"
            data={topInterestsSeminuevos}
          />
        </div>
      </div>
    </div>
  );
};
