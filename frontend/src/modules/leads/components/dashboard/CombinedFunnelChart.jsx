import React from "react";

export const CombinedFunnelChart = ({ digitalData, servicioData, refaccionesData }) => {
  // Aseguramos que haya datos por defecto
  const defaultData = { leads: 0, contactados: 0, citas: 0, shows: 0, ventas: 0 };
  const dData = digitalData || defaultData;
  const sData = servicioData || defaultData;
  const rData = refaccionesData || defaultData;

  // Configuramos las etapas y los departamentos con sus colores
  const stages = [
    { id: "leads", label: "Leads" },
    { id: "contactados", label: "Contactados" },
    { id: "citas", label: "Citas" },
    { id: "shows", label: "Shows" },
    { id: "ventas", label: "Ventas" },
  ];

  const departments = [
    { id: "digital", label: "Digital", data: dData, color: "bg-[#7c3aed]" }, // Morado
    { id: "servicio", label: "Servicio", data: sData, color: "bg-[#2563eb]" }, // Azul
    { id: "refacciones", label: "Refacciones", data: rData, color: "bg-[#f97316]" }, // Naranja
  ];

  // Buscamos el valor máximo entre todos los datos para escalar las barras correctamente al 100%
  const allValues = stages.flatMap((stage) =>
    departments.map((dep) => dep.data[stage.id] || 0)
  );
  const maxValue = Math.max(...allValues, 1); // El 1 evita división por 0

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col h-full font-sans lg:col-span-2 xl:col-span-3">
      {/* HEADER Y LEYENDA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900">Comparativa de Embudos</h3>
          <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mt-1">
            Digital vs Servicio vs Refacciones
          </p>
        </div>
        
        {/* Leyenda de colores */}
        <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
          {departments.map((dep) => (
            <div key={dep.id} className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
              <span className={`w-3 h-3 rounded-full ${dep.color}`}></span>
              {dep.label}
            </div>
          ))}
        </div>
      </div>

      {/* GRÁFICO */}
      <div className="flex flex-col gap-6 grow">
        {stages.map((stage) => (
          <div key={stage.id} className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            
            {/* Etiqueta de la etapa (Ej. "Leads") */}
            <div className="w-24 shrink-0">
              <span className="text-sm font-bold text-gray-700 uppercase tracking-wide">
                {stage.label}
              </span>
            </div>

            {/* Contenedor de las barras */}
            <div className="grow w-full flex flex-col gap-1.5">
              {departments.map((dep) => {
                const value = dep.data[stage.id] || 0;
                // Calculamos el ancho de la barra (con un mínimo de 1% para que siempre se vea una rayita)
                const widthPercent = value === 0 ? 0 : Math.max((value / maxValue) * 100, 1);

                return (
                  <div key={`${stage.id}-${dep.id}`} className="relative flex items-center h-6 w-full group">
                    <div
                      className={`h-full rounded-r md:rounded-r-md transition-all duration-700 ease-out ${dep.color}`}
                      style={{ width: `${widthPercent}%` }}
                    ></div>
                    <span 
                      className={`absolute text-xs font-bold transition-all duration-300
                        ${widthPercent > 1 ? 'left-2 text-white' : 'ml-2 text-gray-600'}
                      `}
                    >
                      {value}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};