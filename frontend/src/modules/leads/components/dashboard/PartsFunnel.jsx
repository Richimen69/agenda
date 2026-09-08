const STAGES = [
  {
    key: "leads",
    label: "Leads",
    width: "w-full", // 100%
    clip: "[clip-path:polygon(0_0,100%_0,95%_100%,5%_100%)]",
    bar: "bg-[#0284C7]", // Azul (Confianza y seguridad)
    dot: "bg-[#0284C7]",
    text: "text-[#0369A1]",
    soft: "bg-[#0284C7]/10",
  },
  {
    key: "cotizacion",
    label: "Cotizaciones",
    width: "w-[77%]", // Ajuste simétrico para mantener la diagonal recta
    clip: "[clip-path:polygon(0_0,100%_0,93%_100%,7%_100%)]",
    bar: "bg-[#334155]", // Gris Grafito (Formalidad, números y experiencia premium)
    dot: "bg-[#334155]",
    text: "text-[#1E293B]",
    soft: "bg-[#334155]/10",
  },
  {
    key: "ventas",
    label: "Ventas",
    width: "w-[55%]", // 55% 
    clip: "[clip-path:polygon(0_0,100%_0,91%_100%,9%_100%)]",
    bar: "bg-[#EB0A1E]", // Rojo Toyota (Decisión, urgencia y cierre)
    dot: "bg-[#EB0A1E]",
    text: "text-[#B91C1C]",
    soft: "bg-[#EB0A1E]/10",
  },
];

const format = (n) => new Intl.NumberFormat("es-MX").format(n);

const rate = (part, whole) =>
  whole > 0 ? Math.round((part / whole) * 1000) / 10 : 0;

export function PartsFunnel({
  data,
  title = "Autos Nuevos",
  subtitle = "mes en curso",
}) {
  if (!data) return null;

  const top = data[STAGES[0].key] ?? 0;
  const bottom = data[STAGES[STAGES.length - 1].key] ?? 0;

  return (
    <section
      aria-label={`Embudo ${title}`}
      className="rounded-2xl border border-gray-200/80 bg-white p-5 shadow-sm sm:p-7"
    >
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-dashed border-gray-200 pb-5">
        <div>
          <h3 className="text-xl font-semibold tracking-tight text-gray-900">
            {title}
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-gray-400">
            {subtitle}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
          <span className="tabular-nums text-gray-900 font-bold md:text-2xl text-xl">
            {data.totalAmount.toLocaleString("es-MX", {
              style: "currency",
              currency: "MXN",
            })}
          </span>
        </div>
      </header>

      <ol className="mt-6 flex flex-col items-center">
        {STAGES.map((stage, i) => {
          const value = data[stage.key] ?? 0;
          const prev = i === 0 ? null : (data[STAGES[i - 1].key] ?? 0);
          const stepRate = prev === null ? null : rate(value, prev);
          const totalRate = rate(value, top);
          const lost = prev === null ? 0 : Math.max(prev - value, 0);

          return (
            <li key={stage.key} className={`${stage.width} group`}>
              {stepRate !== null && (
                <div className="flex items-center justify-center gap-3 py-1.5 text-[11px] font-medium"></div>
              )}

              <div
                className={`relative flex h-16 items-center gap-2 justify-between px-8 text-white transition-transform duration-200 group-hover:scale-[1.015] sm:px-8 ${stage.bar} ${stage.clip}`}
              >
                <span className="flex items-center gap-2.5">
                  <span className="text-sm font-semibold uppercase tracking-wider">
                    {stage.label}
                  </span>
                </span>
                <span className="flex items-baseline gap-1">
                  <span className="text-sm font-semibold tabular-nums">
                    {format(value)}
                  </span>
                  <span className="text-[11px] font-medium tabular-nums text-white/70">
                    {stage.key === "leads" ? null : `${totalRate}%`}
                  </span>
                </span>
              </div>
            </li>
          );
        })}
      </ol>

      <footer className="mt- flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-dashed border-gray-200 pt-4">
        {STAGES.map((stage) => (
          <span
            key={stage.key}
            className="flex items-center gap-2 text-xs font-medium text-gray-500"
          >
            <span
              className={`h-2 w-2 rounded-full ${stage.dot}`}
              aria-hidden="true"
            />
            {stage.label}
            <span className="tabular-nums text-gray-900">
              {format(data[stage.key] ?? 0)}
            </span>
          </span>
        ))}
      </footer>
    </section>
  );
}

export default PartsFunnel;
