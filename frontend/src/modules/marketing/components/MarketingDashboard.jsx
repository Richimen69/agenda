export default function MarketingDashboard({ stats }) {
  if (!stats) return null;

  return (
    <div className="mb-8">
      
      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Total de Clics</span>
          <span className="text-3xl font-bold text-blue-600">{stats.totalClicks}</span>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Enlaces Creados</span>
          <span className="text-3xl font-bold text-gray-800">{stats.totalLinks}</span>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Promedio por Enlace</span>
          <span className="text-3xl font-bold text-emerald-600">{stats.avgClicks}</span>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col">
          <span className="text-sm font-medium text-gray-500 mb-1">Enlaces sin Uso</span>
          <span className="text-3xl font-bold text-red-500">{stats.unusedLinks}</span>
        </div>
      </div>

      {/* TABLA DE TOP PERFORMERS */}
      {stats.topLinks && stats.topLinks.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h3 className="text-md font-semibold text-gray-800 mb-4">Top 5 Campañas Más Exitosas</h3>
          <div className="space-y-3">
            {stats.topLinks.map((link, index) => (
              <div key={link.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-md">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="bg-blue-100 text-blue-700 font-bold h-8 w-8 rounded-full flex items-center justify-center shrink-0">
                    #{index + 1}
                  </div>
                  <div className="truncate">
                    <p className="font-medium text-sm text-gray-800 truncate">/{link.shortCode}</p>
                    <p className="text-xs text-gray-500 truncate" title={link.originalUrl}>{link.originalUrl}</p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="inline-flex items-center bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {link.clicks} clics
                  </span>
                  <p className="text-[10px] text-gray-400 mt-1 text-right">Por {link.user.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}