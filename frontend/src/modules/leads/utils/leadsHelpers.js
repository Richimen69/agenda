/**
 * Debounce genérico para inputs de búsqueda (evita re-render/filtrado en cada tecla)
 */
export function debounce(fn, delay = 300) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Exporta el array de leads a un CSV descargable.
 * Antes el botón "Exportar Datos" no hacía nada.
 */
export function exportLeadsToCSV(leads, filename = "leads.csv") {
  if (!leads?.length) return;

  const headers = Object.keys(leads[0]);
  const rows = leads.map((lead) =>
    headers
      .map((h) => {
        const val = lead[h] ?? "";
        const safe = String(val).replace(/"/g, '""');
        return `"${safe}"`;
      })
      .join(","),
  );

  const csvContent = [headers.join(","), ...rows].join("\n");
  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Formatea montos a MXN. Útil para la columna "Monto Generado".
 */
export function formatCurrency(value) {
  const num = Number(value);
  if (isNaN(num)) return "$0.00";
  return num.toLocaleString("es-MX", {
    style: "currency",
    currency: "MXN",
  });
}

/**
 * Formatea fechas a formato corto legible (dd/mm/yyyy).
 * Acepta ISO string o Date.
 */
export function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (isNaN(date.getTime())) return value; // por si ya viene formateada
  return date.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Filtro global usado por react-table: busca en nombre, teléfono y origen.
 */
export function globalLeadFilter(row, columnId, filterValue) {
  const search = filterValue.toLowerCase();
  const { fullName, phone, source, agent } = row.original;
  return [fullName, phone, source, agent]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(search));
}

/**
 * Config de colores por badge, centralizada (antes estaba hardcoded en el cell).
 */
export const BADGE_COLOR_MAP = {
  "CITAS DE SERVICIO": "bg-green-50 text-green-600",
  ATENDIDO: "bg-green-50 text-green-600",
  NUEVOS: "bg-purple-50 text-purple-600",
  NUEVO: "bg-purple-50 text-purple-600",
  DIGITAL: "bg-blue-50 text-blue-600",
  AGENDADO: "bg-blue-50 text-blue-600",
  OPERADOR: "bg-orange-50 text-orange-600",
  PERDIDO: "bg-orange-50 text-orange-600",
};

export function getBadgeColor(value) {
  return BADGE_COLOR_MAP[value] || "bg-gray-100 text-gray-600";
}