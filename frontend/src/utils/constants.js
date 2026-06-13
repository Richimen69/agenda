export const PRIORITIES = {
  BAJA: "BAJA",
  MEDIA: "MEDIA",
  ALTA: "ALTA",
  URGENTE: "URGENTE",
};

export const PRIORITY_CONFIG = {
  [PRIORITIES.BAJA]: {
    label: "Baja",
    color: "#10B981", // Verde (Tailwind emerald-500)
    bgClass: "text-green-800 border-green-300", // Clases útiles si usas Tailwind
    icon: "ArrowDown", // Nombre o componente del ícono
  },
  [PRIORITIES.MEDIA]: {
    label: "Media",
    color: "#3B82F6", // Azul (Tailwind blue-500)
    bgClass: " text-blue-800 border-blue-300",
    icon: "Minus",
  },
  [PRIORITIES.ALTA]: {
    label: "Alta",
    color: "#F59E0B", // Naranja (Tailwind amber-500)
    bgClass: " text-amber-800 border-amber-300",
    icon: "ArrowUp",
  },
  [PRIORITIES.URGENTE]: {
    label: "Urgente",
    color: "#EF4444", // Rojo (Tailwind red-500)
    bgClass: "text-red-800 border-red-300",
    icon: "AlertTriangle",
  },
};

export const STATUS_CONFIG = {
  NUEVO: {
    label: "Nuevo",
    className: "bg-gray-50 text-gray-600 border-gray-200",
  },
  EN_PROGRESO: {
    label: "En Progreso",
    className: "bg-blue-50 text-blue-600 border-blue-200",
  },
  REVISION: {
    label: "En Revisión",
    className: "bg-yellow-50 text-yellow-600 border-yellow-200",
  },
  COMPLETADO: {
    label: "Completado",
    className: "bg-green-50 text-green-600 border-green-200",
  },
};

export const FILTER_OPTIONS = [
  { label: "Todos", value: "TODOS" },
  { label: "Nuevos", value: "NUEVO" },
  { label: "En Progreso", value: "EN_PROGRESO" },
  { label: "En Revisión", value: "REVISION" },
  { label: "Completados", value: "COMPLETADO" },
];

export const getInitials = (name) => {
  if (!name) return "UN";
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};
