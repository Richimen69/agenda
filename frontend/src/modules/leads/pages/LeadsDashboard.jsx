import React, { useState, useEffect } from "react";
import { BarChart3, Users } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  getCampaignResults,
  getRecoveryFunnel,
  getDigitalFunnel,
  getAmount,
  getLeadCount,
} from "../services/leads.api";
import { RecoveryFunnel } from "../components/dashboard/RecoveryFunnel";
import { DigitalFunnel } from "../components/dashboard/DigitalFunnel";
import { CardAmount } from "../components/dashboard/CardAmount";

const getCurrentMonth = () => new Date().toISOString().slice(0, 7);

export const LeadsDashboard = () => {
  const [nuevosFunnel, setNuevosFunnel] = useState(null);
  const [seminuevosFunnel, setSeminuevosFunnel] = useState(null);
  const [servicioFunnel, setServicioFunnel] = useState(null);
  const [refaccionesFunnel, setRefaccionesFunnel] = useState(null);
  const [leadCount, setLeadCount] = useState(null);

  const [month, setMonth] = useState(getCurrentMonth());
  const [campaigns, setCampaigns] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [digitalFunnel, setDigitalFunnel] = useState(null);
  const [generatedAmount, setGeneratedAmount] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getCampaignResults(month),
      getRecoveryFunnel(month),
      getDigitalFunnel(month, "NUEVOS"),
      getDigitalFunnel(month, "SEMINUEVOS"),
      getDigitalFunnel(month, "SERVICIO"),
      getAmount(month, ["SERVICIO"]),
      getLeadCount(month),
      getDigitalFunnel(month, "REFACCIONES"),
      getDigitalFunnel(month, "DIGITAL"),
    ])
      .then(
        ([
          campaignRes,
          funnelRes,
          nuevosRes,
          seminuevosRes,
          servicioRes,
          amountRes,
          leadCountRes,
          refaccionesRes,
          digitalRes,
        ]) => {
          setCampaigns(campaignRes.data);
          setFunnel(funnelRes.data);
          setNuevosFunnel(nuevosRes.data);
          setSeminuevosFunnel(seminuevosRes.data);
          setServicioFunnel(servicioRes.data);
          setGeneratedAmount(amountRes.data);
          setLeadCount(leadCountRes.data);
          setRefaccionesFunnel(refaccionesRes.data);
          setDigitalFunnel(digitalRes.data);
        },
      )
      .catch((err) => console.error("Error cargando dashboard:", err))
      .finally(() => setLoading(false));
  }, [month]);

  return (
    <div className="min-h-screen p-4 lg:p-8 font-sans">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">
          Dashboard de Leads
        </h2>
        <input
          type="month"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="mt-4 sm:mt-0 border border-gray-200 rounded-md px-3 py-2 text-sm text-gray-700"
        />
      </div>

      {loading ? (
        <p className="text-gray-400 text-sm">Cargando dashboard...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* PANEL: Resultados por Campaña */}
          <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-4 h-4 text-brand" />
              <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                Resultados por Campaña
              </h3>
            </div>

            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={campaigns?.data || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f1f1" />
                <XAxis
                  dataKey="campaign"
                  tick={{ fontSize: 11 }}
                  interval={0}
                  angle={-15}
                  textAnchor="end"
                  height={60}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar
                  dataKey="leads"
                  fill="#e8543b"
                  radius={[4, 4, 0, 0]}
                  name="Leads generados"
                />
              </BarChart>
            </ResponsiveContainer>

            <div className="flex justify-center mt-3">
              <div className="flex items-center gap-2 bg-red-50 text-brand px-4 py-1.5 rounded-full text-sm font-medium">
                <Users className="w-4 h-4" />
                Total: {campaigns?.totalLeads || 0} leads
              </div>
            </div>
          </div>

          {/* PANEL: Seguimiento y Recuperación */}
          <RecoveryFunnel data={funnel} />
          <div className="col-span-2 grid grid-cols-2 gap-4">
            <CardAmount
              title="Leads"
              amount={leadCount}
              loading={loading}
              type="count"
            />
            <CardAmount
              title="Monto generado por Servicio"
              amount={generatedAmount}
              loading={loading}
              type="amount"
            />
          </div>
          <div className="col-span-2 grid grid-cols-3 gap-6">
            <DigitalFunnel data={nuevosFunnel} title="Autos Nuevos" />
            <DigitalFunnel data={seminuevosFunnel} title="Seminuevos" />
            <DigitalFunnel data={servicioFunnel} title="Servicio" />
            <DigitalFunnel data={refaccionesFunnel} title="Refacciones" />
            <DigitalFunnel data={digitalFunnel} title="Digital" />
          </div>
        </div>
      )}
    </div>
  );
};
