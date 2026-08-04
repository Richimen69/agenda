import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  normalizeDepartment,
  normalizeBranch,
  normalizeStatus,
  normalizeAssignment,
  normalizeFloat,
  normalizeSource,
} from "./enumMappers";

// Campos que tu sistema espera. Ajusta según tu modelo real.
// 3. Agrega el transform al campo date en LEAD_FIELDS
export function normalizeDate(value) {
  if (!value) return null;

  // Ya es un objeto Date válido (viene de cellDates:true)
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value.toISOString();
  }

  // Número de serie de Excel (ej. 46206) — puede venir como number o string
  const asNumber = Number(value);
  if (!isNaN(asNumber) && asNumber > 20000 && asNumber < 60000) {
    // 20000 ~ año 1954, 60000 ~ año 2064: rango razonable para evitar
    // confundir un serial de fecha con un teléfono corto o un ID
    const excelEpoch = new Date(Date.UTC(1899, 11, 30));
    const converted = new Date(excelEpoch.getTime() + asNumber * 86400000);
    if (!isNaN(converted.getTime())) return converted.toISOString();
  }

  // String tipo "2026-07-03" o "03/07/2026"
  const parsed = new Date(value);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();

  return null; // no se pudo parsear — mejor null que reventar Prisma
}
export const LEAD_FIELDS = [
  { key: "fullName", label: "Nombre completo", required: true },
  {
    key: "phone",
    label: "Teléfono",
    required: true,
    transform: normalizePhone,
  },
  { key: "date", label: "Fecha", required: false, transform: normalizeDate },
  {
    key: "source",
    label: "Origen",
    required: true,
    transform: normalizeSource,
  }, // requerido en schema
  {
    key: "department",
    label: "Área",
    required: false,
    enumMap: normalizeDepartment,
  },
  { key: "agent", label: "Responsable", required: false },
  { key: "interest", label: "Interés", required: false },
  { key: "status", label: "Estado", required: false, enumMap: normalizeStatus },
  {
    key: "firstContactTime",
    label: "Tiempo de contacto",
    required: false,
    transform: normalizeFloat,
  },
  {
    key: "assignment",
    label: "Asignación",
    required: false,
    transform: normalizeAssignment,
  },
  {
    key: "branch",
    label: "Sucursal",
    required: false,
    enumMap: normalizeBranch,
  },
  {
    key: "hasAppointment",
    label: "Cita",
    required: false,
    transform: normalizeBoolean,
  },
  {
    key: "showedUp",
    label: "Show",
    required: false,
    transform: normalizeBoolean,
  },
  {
    key: "hasQuote",
    label: "Cotización",
    required: false,
    transform: normalizeBoolean,
  },
  {
    key: "isReturning",
    label: "Reingreso",
    required: false,
    transform: normalizeBoolean,
  },
];

/**
 * Aplica un mapeo { campoDestino: columnaOrigen } a las filas crudas
 * y devuelve objetos listos con las keys que tu API espera.
 */
export function applyColumnMapping(rows, mapping) {
  return rows
    .map((row) => {
      const mapped = {};
      const warnings = [];

      LEAD_FIELDS.forEach((field) => {
        const sourceColumn = mapping[field.key];
        if (!sourceColumn) return;
        const raw = row[sourceColumn];

        if (field.enumMap) {
          const result = field.enumMap(raw);
          mapped[field.key] = result.value;
          if (result.wasUnmapped && result.original) {
            warnings.push(
              `${field.label}: "${result.original}" no coincide con ningún valor conocido, se usó "${result.value}" por defecto`,
            );
          }
        } else {
          mapped[field.key] = field.transform
            ? field.transform(raw)
            : String(raw ?? "").trim();
        }
      });

      // FIX: ya no metemos __warnings dentro de "mapped". Devolvemos
      // un objeto separado: { data, warnings }. "data" es justo lo
      // que se le puede mandar a Prisma sin filtrar nada raro.
      return { data: mapped, warnings };
    })
    .filter((entry) => !isGhostRow(entry.data));
}
/**
 * Valida las filas ya mapeadas contra los campos requeridos.
 * Devuelve { valid: [...], invalid: [{ row, index, errors }] }
 */
export function validateMappedRows(rows) {
  const valid = [];
  const warned = [];
  const invalid = [];

  rows.forEach(({ data, warnings }, index) => {
    const errors = [];
    LEAD_FIELDS.forEach((field) => {
      if (field.required && !data[field.key])
        errors.push(`${field.label} vacío`);
    });
    if (data.phone && data.phone.length < 10)
      errors.push("Teléfono inválido (menos de 10 dígitos)");

    if (errors.length) {
      invalid.push({ row: data, index, errors });
    } else if (warnings.length) {
      warned.push({ row: data, index, warnings });
    } else {
      valid.push(data);
    }
  });

  return { valid, warned, invalid };
}

/**
 * Detecta duplicados dentro del propio archivo importado (por teléfono).
 */
export function findDuplicatesInFile(rows) {
  const seen = new Map();
  const duplicates = [];
  rows.forEach((row, index) => {
    const key = row.phone?.replace(/\D/g, "");
    if (!key) return;
    if (seen.has(key)) {
      duplicates.push({ index, phone: row.phone, duplicateOf: seen.get(key) });
    } else {
      seen.set(key, index);
    }
  });
  return duplicates;
}

/**
 * Genera y descarga una plantilla CSV con los headers correctos,
 * para que el usuario no adivine cómo debe llenar el archivo.
 */
export function downloadImportTemplate() {
  const headers = LEAD_FIELDS.map((f) => f.key).join(",");
  const example = "Juan Pérez,7441234567,Facebook,NUEVOS,Ricardo,SUV,Acapulco";
  const csv = `${headers}\n${example}`;
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "plantilla_leads.csv";
  link.click();
  URL.revokeObjectURL(url);
}

function detectHeaderRowIndex(
  rows2D,
  expectedKeywords = ["NOMBRE", "TELÉFONO", "FECHA"],
) {
  const maxScan = Math.min(rows2D.length, 15);
  for (let i = 0; i < maxScan; i++) {
    const row = rows2D[i].map((c) =>
      String(c ?? "")
        .toUpperCase()
        .trim(),
    );
    const matches = expectedKeywords.filter((kw) => row.includes(kw));
    if (matches.length >= 2) return i;
  }
  return 0; // fallback: asume primera fila
}

/**
 * Convierte valores tipo SI/NO/SÍ/S/N a booleano real.
 */
export function normalizeBoolean(value) {
  const v = String(value ?? "")
    .trim()
    .toUpperCase();
  return ["SI", "SÍ", "S", "TRUE", "1"].includes(v);
}

/**
 * Normaliza teléfonos mixtos (número puro o string con espacios) a solo dígitos.
 */
export function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

/**
 * Descarta filas "fantasma": sin nombre Y sin teléfono, aunque tengan
 * algún valor suelto (como tu columna MES rellenada de más).
 */
export function isGhostRow(mappedRow) {
  return !mappedRow.fullName?.trim() && !mappedRow.phone?.trim();
}

// Reemplaza parseImportFile para .xlsx: en vez de sheet_to_json directo,
// primero convierte a array de arrays para detectar el header real.
export function parseImportFile(file) {
  return new Promise((resolve, reject) => {
    const ext = file.name.split(".").pop().toLowerCase();

    if (ext === "csv") {
      Papa.parse(file, {
        header: false,
        skipEmptyLines: true,
        complete: (results) => resolve(rowsToParsed(results.data)),
        error: reject,
      });
      return;
    }

    if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const workbook = XLSX.read(e.target.result, {
            type: "array",
            cellDates: true,
          });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const rows2D = XLSX.utils.sheet_to_json(sheet, {
            header: 1,
            defval: "",
            raw: false,
            dateNF: "yyyy-mm-dd",
          });
          resolve(rowsToParsed(rows2D));
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
      return;
    }

    reject(new Error("Formato no soportado. Usa .csv, .xlsx o .xls"));
  });
}

function rowsToParsed(rows2D) {
  const headerIndex = detectHeaderRowIndex(rows2D);
  const headers = rows2D[headerIndex].map((h) => String(h ?? "").trim());
  const dataRows = rows2D
    .slice(headerIndex + 1)
    .filter((r) => r.some((c) => String(c ?? "").trim() !== ""));
  const objRows = dataRows.map((r) => {
    const obj = {};
    headers.forEach((h, i) => (obj[h] = r[i] ?? ""));
    return obj;
  });
  return { headers, rows: objRows, headerRowSkipped: headerIndex };
}

export function sanitizeForPrisma(data) {
  const allowedKeys = LEAD_FIELDS.map((f) => f.key);
  return Object.fromEntries(
    Object.entries(data).filter(([key]) => allowedKeys.includes(key)),
  );
}

export function classifyDuplicates(rows, matchMap) {
  return rows.map((row) => {
    const match = matchMap[row.phone];
    if (!match) return { ...row, duplicateStatus: "none" };
    return {
      ...row,
      duplicateStatus: match.isRecent ? "recent" : "returning",
      duplicateMatch: match,
    };
  });
}