import * as XLSX from "xlsx"; // si ya lo tienes importado en otro lado, quita esta línea

// --- DEPARTMENT ---
// Excel (AREA) -> Prisma enum Department
const DEPARTMENT_MAP = {
  NUEVOS: "NUEVOS",
  SEMINUEVOS: "SEMINUEVOS",
  "CITAS DE SERVICIO": "SERVICIO",
  OPERADOR: "OPERADOR",
  REFACCIONES: "REFACCIONES",
  DIGITAL: "DIGITAL",
};

const CONTACT_METHOD_MAP = {
  WHATSAPP: "WHATSAPP",
  LLAMADA: "LLAMADA",
  "FACEBOOK MESSENGER": "FACEBOOK_MESSENGER",
  MESSENGER: "FACEBOOK_MESSENGER",
  INSTAGRAM: "INSTAGRAM",
  "FORMULARIO WEB": "FORMULARIO_WEB",
};

// --- BRANCH ---
const BRANCH_MAP = {
  GUERRERO: "GUERRERO",
  CHILPANCINGO: "CHILPANCINGO",
  "TOYOTA DIGITAL": "DIGITAL", // <- no coinciden textualmente
  DIGITAL: "DIGITAL",
};

const STATUS_MAP = {
  NUEVO: "NUEVO",
  ATENDIDO: "ATENDIDO",
  AGENDADO: "AGENDADO",
  PERDIDO: "PERDIDO",
  ASIGNADO: "NUEVO", // decisión por defecto, ver nota abajo
};
const FASE_MAP = {
  R1_POR_CONTACTAR: "R1_POR_CONTACTAR",
  R2_CONTACTADO: "R2_CONTACTADO",
  R3_ASIGNADO: "R3_ASIGNADO",
};

/**
 * Normaliza un valor libre contra un diccionario de enum.
 * Devuelve { value, wasUnmapped, original } para poder marcar advertencias.
 */
function mapToEnum(rawValue, map, fallback) {
  const key = String(rawValue ?? "")
    .trim()
    .toUpperCase();
  if (map[key]) {
    return { value: map[key], wasUnmapped: false, original: rawValue };
  }
  return { value: fallback, wasUnmapped: true, original: rawValue };
}

export function normalizeDepartment(value) {
  return mapToEnum(value, DEPARTMENT_MAP, "NUEVOS");
}

export function normalizeBranch(value) {
  return mapToEnum(value, BRANCH_MAP, "GUERRERO");
}

export function normalizeStatus(value) {
  return mapToEnum(value, STATUS_MAP, "NUEVO");
}

export function normalizeFase(value) {
  const result = mapToEnum(value, FASE_MAP, null);
  
  return result?.value || null; 
}

/**
 * "NA" es un valor real en tu columna ASIGNACIÓN que significa "sin asignar",
 * no un nombre. Lo convertimos a null en vez de guardarlo literal.
 */
export function normalizeAssignment(value) {
  const v = String(value ?? "").trim();
  return v === "" || v.toUpperCase() === "NA" ? null : v;
}

/**
 * firstContactTime llega como string ("6") pero el schema pide Float.
 */
export function normalizeFloat(value) {
  if (value === "" || value === null || value === undefined) return null;

  // Limpia símbolos de moneda, espacios y comas de miles: "$1,500.00" -> "1500.00"
  const cleaned = String(value).replace(/[$,\s]/g, "");

  const num = Number(cleaned);
  return isNaN(num) ? null : num;
}

/**
 * source es requerido (String, sin "?") en el schema. Si viene vacío,
 * no podemos mandar "" silenciosamente sin que el usuario lo sepa.
 */
export function normalizeSource(value) {
  const v = String(value ?? "").trim();
  return v === "" ? "SIN ORIGEN" : v;
}

export function normalizeContactMethod(value) {
  const key = String(value ?? "")
    .trim()
    .toUpperCase();
  if (CONTACT_METHOD_MAP[key]) {
    return {
      value: CONTACT_METHOD_MAP[key],
      wasUnmapped: false,
      original: value,
    };
  }
  return { value: "WHATSAPP", wasUnmapped: true, original: value };
}
