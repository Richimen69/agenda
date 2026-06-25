export default function EventosList() {
  return (
    <div>
      <p className="text-content-main font-bold text-xl">Proximos Eventos</p>
      <div className="space-y-2 mt-4">
        <div className="bg-layout-surface shadow-sm overflow-hidden border-brand/30 border-2 rounded-xl py-4 px-7">
          <p className="text-xs font-bold text-brand py-2">Hoy 14:00</p>
          <p className="text-content-main font-bold">Reunion con Narobial</p>
          <p className="text-content-muted text-xs">Sesión 2 ADVISOR</p>
        </div>
        <div className="bg-layout-surface shadow-sm overflow-hidden border-blue-500/30 border-2 rounded-xl py-4 px-7">
          <p className="text-xs font-bold text-blue-500 py-2">Hoy 14:00</p>
          <p className="text-content-main font-bold">Reunion con Narobial</p>
          <p className="text-content-muted text-xs">Sesión 3 MECHANIC - Contenidos: Mi Agenda - Fichajes - Propuestas - Control de Calidad.</p>
        </div>
      </div>
    </div>
  );
}
