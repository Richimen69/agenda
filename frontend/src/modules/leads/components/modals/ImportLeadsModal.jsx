import React, { useState } from "react";
import { X, Upload, Download, AlertTriangle, CheckCircle2 } from "lucide-react";
import {
  LEAD_FIELDS,
  parseImportFile,
  applyColumnMapping,
  validateMappedRows,
  findDuplicatesInFile,
  downloadImportTemplate,
  classifyDuplicates,
} from "../../utils/importHelpers";
import { checkDuplicatePhones } from "../../services/leads.api";

const STEPS = { UPLOAD: 1, MAPPING: 2, PREVIEW: 3, DONE: 4 };

export const ImportLeadsModal = ({
  isOpen,
  onClose,
  onImport,
  importProgress,
}) => {
  const [step, setStep] = useState(STEPS.UPLOAD);
  const [fileData, setFileData] = useState(null); // { headers, rows }
  const [mapping, setMapping] = useState({});
  const [validation, setValidation] = useState(null); // { valid, invalid }
  const [duplicates, setDuplicates] = useState([]);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [duplicateChecked, setDuplicateChecked] = useState(false);
  const [rowsWithDuplicateInfo, setRowsWithDuplicateInfo] = useState([]);

  if (!isOpen) return null;

  const reset = () => {
    setStep(STEPS.UPLOAD);
    setFileData(null);
    setMapping({});
    setValidation(null);
    setDuplicates([]);
    setResult(null);
    setError("");
  };

  const handleClose = () => {
    reset();
    onClose();
  };
  const handleCheckDuplicates = async () => {
    const allRows = [
      ...validation.valid,
      ...validation.warned.map((w) => w.row),
    ];
    const phones = allRows.map((r) => r.phone).filter(Boolean);

    const response = await checkDuplicatePhones(phones);
    const classified = classifyDuplicates(allRows, response.data || {});
    setRowsWithDuplicateInfo(classified);
    setDuplicateChecked(true);
  };

  const handleImport = async () => {
    // Los "returning" se importan normal pero forzando isReturning: true
    const toImport = rowsWithDuplicateInfo
      .filter((r) => r.duplicateStatus !== "excluded") // el usuario pudo excluir algunos
      .map((r) =>
        r.duplicateStatus === "returning" ? { ...r, isReturning: true } : r,
      );

    const res = await onImport(toImport);
    setResult(res);
    setStep(STEPS.DONE);
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setError("");
    try {
      const parsed = await parseImportFile(file);
      if (!parsed.rows.length) {
        setError("El archivo no tiene filas de datos.");
        return;
      }
      setFileData(parsed);

      // Auto-mapeo por nombre similar (case-insensitive)
      const autoMapping = {};
      LEAD_FIELDS.forEach((field) => {
        const match = parsed.headers.find(
          (h) =>
            h.toLowerCase().trim() === field.key.toLowerCase() ||
            h.toLowerCase().trim() === field.label.toLowerCase(),
        );
        if (match) autoMapping[field.key] = match;
      });
      setMapping(autoMapping);
      setStep(STEPS.MAPPING);
    } catch (err) {
      setError("No se pudo leer el archivo. Verifica el formato.");
      console.error(err);
    }
  };

  const handleConfirmMapping = () => {
    const missingRequired = LEAD_FIELDS.filter(
      (f) => f.required && !mapping[f.key],
    );
    if (missingRequired.length) {
      setError(
        `Falta mapear: ${missingRequired.map((f) => f.label).join(", ")}`,
      );
      return;
    }
    setError("");
    const mapped = applyColumnMapping(fileData.rows, mapping);
    setValidation(validateMappedRows(mapped));
    setDuplicates(findDuplicatesInFile(mapped));
    setStep(STEPS.PREVIEW);
  };


  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Importar Leads
          </h3>
          <button onClick={handleClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        {error && (
          <div className="flex items-center gap-2 bg-red-50 text-red-600 text-sm px-3 py-2 rounded-md mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* PASO 1: SUBIR ARCHIVO */}
        {step === STEPS.UPLOAD && (
          <div className="space-y-4">
            <button
              onClick={downloadImportTemplate}
              className="flex items-center gap-2 text-sm text-brand hover:underline"
            >
              <Download className="w-4 h-4" />
              Descargar plantilla CSV
            </button>

            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-gray-200 rounded-xl py-10 cursor-pointer hover:border-brand transition-colors">
              <Upload className="w-8 h-8 text-gray-400" />
              <span className="text-sm text-gray-500">
                Haz clic o arrastra tu archivo (.csv, .xlsx)
              </span>
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFile}
                className="hidden"
              />
            </label>
          </div>
        )}

        {/* PASO 2: MAPEO DE COLUMNAS */}
        {step === STEPS.MAPPING && fileData && (
          <div className="space-y-4">
            <p className="text-sm text-gray-500">
              Relaciona las columnas de tu archivo con los campos del sistema.
            </p>
            <div className="space-y-2">
              {LEAD_FIELDS.map((field) => (
                <div key={field.key} className="flex items-center gap-3">
                  <label className="w-40 text-sm text-gray-700 shrink-0">
                    {field.label}{" "}
                    {field.required && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    value={mapping[field.key] || ""}
                    onChange={(e) =>
                      setMapping({ ...mapping, [field.key]: e.target.value })
                    }
                    className="flex-1 border border-gray-200 rounded-md px-2 py-1.5 text-sm"
                  >
                    <option value="">-- No importar --</option>
                    {fileData.headers.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(STEPS.UPLOAD)}
                className="text-sm text-gray-500 hover:underline"
              >
                ← Cambiar archivo
              </button>
              <button
                onClick={handleConfirmMapping}
                className="px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-[#e8543b]"
              >
                Continuar
              </button>
            </div>
          </div>
        )}

        {/* PASO 3: PREVIEW Y VALIDACIÓN */}
        {step === STEPS.PREVIEW && validation && (
          <div className="space-y-4">
            <div className="flex gap-4 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle2 className="w-4 h-4" /> {validation.valid.length}{" "}
                listos
              </span>
              {validation.warned.length > 0 && (
                <span className="flex items-center gap-1 text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />{" "}
                  {validation.warned.length} con advertencias (se importan
                  igual)
                </span>
              )}
              {validation.invalid.length > 0 && (
                <span className="flex items-center gap-1 text-red-500">
                  <AlertTriangle className="w-4 h-4" />{" "}
                  {validation.invalid.length} con errores (no se importan)
                </span>
              )}
            </div>

            <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-md">
              <table className="w-full text-xs">
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th className="text-left px-2 py-1.5">Nombre</th>
                    <th className="text-left px-2 py-1.5">Teléfono</th>
                    <th className="text-left px-2 py-1.5">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {validation.valid.map((row, i) => (
                    <tr key={`v-${i}`} className="border-t border-gray-50">
                      <td className="px-2 py-1.5">{row.fullName}</td>
                      <td className="px-2 py-1.5">{row.phone}</td>
                      <td className="px-2 py-1.5 text-green-600">OK</td>
                    </tr>
                  ))}
                  {validation.invalid.map((item, i) => (
                    <tr
                      key={`i-${i}`}
                      className="border-t border-gray-50 bg-red-50/50"
                    >
                      <td className="px-2 py-1.5">
                        {item.row.fullName || "-"}
                      </td>
                      <td className="px-2 py-1.5">{item.row.phone || "-"}</td>
                      <td className="px-2 py-1.5 text-red-500">
                        {item.errors.join(", ")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {importProgress && (
              <div className="text-sm text-gray-500">
                Importando {importProgress.done}/{importProgress.total}...
                <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
                  <div
                    className="bg-brand h-1.5 rounded-full transition-all"
                    style={{
                      width: `${(importProgress.done / importProgress.total) * 100}%`,
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between pt-2">
              <button
                onClick={() => setStep(STEPS.MAPPING)}
                className="text-sm text-gray-500 hover:underline"
              >
                ← Volver
              </button>
              <button
                onClick={handleImport}
                disabled={!validation.valid.length || !!importProgress}
                className="px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-[#e8543b] disabled:opacity-50"
              >
                Importar {validation.valid.length} leads
              </button>
            </div>
          </div>
        )}

        {/* PASO 4: RESULTADO */}
        {step === STEPS.DONE && result && (
          <div className="space-y-4 text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
            <p className="text-gray-700">
              Se importaron <strong>{result.success.length}</strong> leads
              correctamente.
            </p>
            {result.failed.length > 0 && (
              <p className="text-sm text-red-500">
                {result.failed.length} fallaron al guardarse en el servidor.
              </p>
            )}
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-[#e8543b]"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
      {duplicateChecked && (
        <div className="max-h-64 overflow-y-auto border border-gray-100 rounded-md">
          <table className="w-full text-xs">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left px-2 py-1.5">Nombre</th>
                <th className="text-left px-2 py-1.5">Teléfono</th>
                <th className="text-left px-2 py-1.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {rowsWithDuplicateInfo.map((row, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="px-2 py-1.5">{row.fullName}</td>
                  <td className="px-2 py-1.5">{row.phone}</td>
                  <td className="px-2 py-1.5">
                    {row.duplicateStatus === "none" && (
                      <span className="text-green-600">Nuevo</span>
                    )}
                    {row.duplicateStatus === "returning" && (
                      <span className="text-blue-600">
                        Reingreso (último: hace {row.duplicateMatch.daysSince}{" "}
                        días)
                      </span>
                    )}
                    {row.duplicateStatus === "recent" && (
                      <span className="text-orange-500">
                        ⚠ Posible duplicado: mismo lead hace{" "}
                        {row.duplicateMatch.daysSince} días (
                        {row.duplicateMatch.status})
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
