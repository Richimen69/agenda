export function ServiceTypesList({ serviceTypes }) {
  if (serviceTypes.length === 0) {
    return (
      <p className="text-sm text-gray-400 bg-white border p-6 rounded-2xl">
        No hay servicios parametrizados aún en la base de datos.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {serviceTypes.map((service) => (
        <ServiceTypeCard key={service.id} service={service} />
      ))}
    </div>
  );
}

function ServiceTypeCard({ service }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900 text-sm">{service.name}</h3>
        {service.description && <p className="text-xs text-gray-500 mt-1">{service.description}</p>}
      </div>

      <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl overflow-x-auto">
        {service.stages.map((stage, sIdx) => (
          <div key={stage.id} className="flex items-center gap-3 shrink-0">
            <div className="flex flex-col items-center">
              <div className="w-6 h-6 rounded-full bg-red-100 text-red-600 font-bold text-[10px] flex items-center justify-center">
                {stage.order}
              </div>
              <span className="text-[10px] font-bold text-gray-700 mt-1">{stage.name}</span>
            </div>
            {sIdx < service.stages.length - 1 && (
              <span className="text-gray-300 font-bold text-xs">➔</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}