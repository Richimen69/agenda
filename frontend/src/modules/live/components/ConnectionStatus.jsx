import { CheckCircle2, Clock, User, Car, Wrench, Tag } from 'lucide-react';

export function ConnectionError({ message }) {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center p-4">
      <div className="p-4 text-red-500 bg-red-950/40 border border-red-900 rounded-xl max-w-md text-center">
        <p className="font-bold">Error de Conexión</p>
        <p className="text-sm text-red-400 mt-1">{message}</p>
      </div>
    </div>
  );
}

export function ConnectionLoading() {
  return (
    <div className="w-full h-screen bg-white flex items-center justify-center text-slate-500">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Estableciendo conexión...</p>
      </div>
    </div>
  );
}

/**
 * Se muestra cuando alguien (técnico, cliente o supervisor) abre el link
 * de una sesión que ya fue finalizada. session es opcional; si trae
 * roomName / customerName / vehicleModel / technician, se muestra un
 * resumen de la sesión en una tarjeta de detalles.
 */
export function SessionFinished({ session }) {
  const hasDetails = session && (
    session.roomName || session.customerName || session.vehicleModel || session.technician?.name
  );

  return (
    <div className="w-full h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="h-1.5 bg-gradient-to-r from-red-600 via-red-500 to-red-600" />

        <div className="p-8 text-center">
          <div className="relative w-20 h-20 mx-auto mb-6">
            <div className="absolute inset-0 rounded-full bg-emerald-500/10 animate-ping" />
            <div className="relative w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
            </div>
          </div>

          <span className="bg-red-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider inline-block mb-3">
            Toyota Live
          </span>

          <h2 className="text-xl font-bold text-white tracking-tight">Transmisión Finalizada</h2>
          <p className="text-sm text-slate-400 mt-2 leading-relaxed max-w-sm mx-auto">
            El servicio de monitoreo en tiempo real para este vehículo ha concluido.
            Gracias por confiar en el taller Toyota Guerrero.
          </p>

          {hasDetails && (
            <div className="mt-7 bg-slate-900/60 border border-slate-800 rounded-xl divide-y divide-slate-800 text-left overflow-hidden">
              {session.roomName && (
                <DetailRow icon={Tag} label="Identificador" value={session.roomName} />
              )}
              {session.customerName && (
                <DetailRow icon={User} label="Cliente" value={session.customerName} />
              )}
              {session.vehicleModel && (
                <DetailRow icon={Car} label="Vehículo" value={session.vehicleModel} />
              )}
              {session.technician?.name && (
                <DetailRow icon={Wrench} label="Técnico" value={session.technician.name} />
              )}
            </div>
          )}

          <div className="mt-7 flex items-center justify-center gap-2 text-slate-600">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] uppercase tracking-wider font-semibold">
              Puedes cerrar esta ventana con seguridad
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex-1 flex items-center justify-between gap-2 min-w-0">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">{label}</span>
        <span className="text-sm font-semibold text-slate-200 text-right truncate">{value}</span>
      </div>
    </div>
  );
}