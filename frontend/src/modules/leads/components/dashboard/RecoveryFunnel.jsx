import React from "react";
import { MessageCircle, User, Scissors, RefreshCw, Users, DollarSign } from "lucide-react";

// Agregamos un sexto color al degradado (#FECACA es un rojo aún más claro)
const FUNNEL_COLORS = ["#B91C1C", "#DC2626", "#EF4444", "#F87171", "#FCA5A5", "#FECACA"];

// Agregamos DollarSign para representar las ventas
const FUNNEL_ICONS = [MessageCircle, User, Scissors, RefreshCw, Users, DollarSign];

export const RecoveryFunnel = ({ data }) => {
  if (!data) return null;

  const steps = [
    { value: data.leadsTotales, label: "conversaciones con leads" },
    { value: data.enSeguimiento, label: "en seguimiento", badge: `${data.conversionRate}% de conversión` },
    { value: data.noContactables, label: "no contactados" },
    { value: data.recuperados, label: "llamadas realizadas", badge: `${data.recuperacionRate}% llamadas` },
    { value: data.traidosDeVuelta, label: "clientes traídos de vuelta para nuevos y comonuevos", badge: `${data.efectividadRate}% de efectividad` },
    { value: data.ventasReingreso || 0, label: "ventas generadas por reingreso" },
  ];

  return (
    <div className="bg-white rounded-xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] border border-gray-100 p-5">
      <div className="flex items-center gap-2 mb-5">
        <div className="w-7 h-7 rounded-full bg-brand flex items-center justify-center shrink-0">
          <RefreshCw className="w-3.5 h-3.5 text-white" />
        </div>
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide">
          Seguimiento y Recuperación de NUEVOS Y SEMINUEVOS
        </h3>
      </div>

      <div className="space-y-0">
        {steps.map((step, i) => {
          // La lógica matemática del clipPath ya soporta el 6to elemento automáticamente sin romperse
          const topInset = i * 7;
          const bottomInset = (i + 1) * 7;
          const Icon = FUNNEL_ICONS[i];

          return (
            <div key={step.label} className="flex items-center gap-3">
              {/* Trapecio con el ícono dentro */}
              <div
                className="h-16 flex items-center justify-center shrink-0"
                style={{
                  width: "110px",
                  backgroundColor: FUNNEL_COLORS[i],
                  clipPath: `polygon(${topInset}% 0, ${100 - topInset}% 0, ${100 - bottomInset}% 100%, ${bottomInset}% 100%)`,
                }}
              >
                <Icon className="w-6 h-6 text-white" strokeWidth={2} />
              </div>

              {/* Número + label */}
              <div className="flex items-center gap-2 flex-1 py-3 border-b border-gray-50">
                <span className="text-brand text-lg">»</span>
                <span className="text-2xl font-bold text-brand shrink-0">{step.value}</span>
                <span className="text-sm text-gray-600 leading-tight">{step.label}</span>
                
                {/* Opcional: renderizar el badge si existe */}
                {step.badge && (
                  <span className="ml-auto text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded">
                    {step.badge}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};