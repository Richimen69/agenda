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