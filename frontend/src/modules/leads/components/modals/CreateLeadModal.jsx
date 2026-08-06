import React, { useState } from "react";
import { X, ArrowRightCircle } from "lucide-react";
import { checkDuplicatePhones } from "../../services/leads.api";

const initialForm = {
  fullName: "",
  phone: "",
  source: "",
  department: "NUEVOS",
  interest: "",
};

export const CreateLeadModal = ({
  isOpen,
  onClose,
  onCreate,
  onReactivate,
  creating,
}) => {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [duplicateWarning, setDuplicateWarning] = useState(null);

  const handlePhoneBlur = async () => {
    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) return;

    try {
      const response = await checkDuplicatePhones([cleanPhone]);
      const match = response.data?.[cleanPhone];
      // Ya NO filtramos por isRecent: cualquier match existente significa
      // "este cliente ya existe", sin importar si fue hace 5 días o 5 meses.
      setDuplicateWarning(match || null);
    } catch (error) {
      console.error("No se pudo verificar duplicados:", error);
      setDuplicateWarning(null);
    }
  };

  if (!isOpen) return null;

  const reset = () => {
    setForm(initialForm);
    setError("");
    setDuplicateWarning(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // En modo reingreso, el nombre viene del lead existente, no de form.fullName
    if (!duplicateWarning && !form.fullName.trim()) {
      setError("El nombre es obligatorio");
      return;
    }

    const cleanPhone = form.phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      setError("El teléfono debe tener 10 dígitos");
      return;
    }
    setError("");

    if (duplicateWarning) {
      const ok = await onReactivate(duplicateWarning.id, {
        newInterest: form.interest || undefined,
        newSource: form.source || undefined,
        note: `Reingreso: ${form.interest || "nuevo interés"} vía ${form.source || "sin especificar"}`,
      });
      if (ok) reset();
      onClose();
      return;
    }

    const ok = await onCreate({ ...form, phone: cleanPhone });
    if (ok !== false) reset();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {duplicateWarning ? "Reingreso de Lead" : "Nuevo Lead"}
          </h3>
          <button onClick={handleClose}>
            <X className="w-5 h-5 text-gray-400 hover:text-gray-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500">
              Nombre completo *
            </label>
            <input
              autoFocus
              value={
                duplicateWarning ? duplicateWarning.fullName : form.fullName
              }
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:border-brand"
              placeholder="Ej. Juan Pérez"
              disabled={!!duplicateWarning}
            />
          </div>

          <div>
            <label className="text-xs font-medium text-gray-500">
              Teléfono *
            </label>
            <input
              value={form.phone}
              onBlur={handlePhoneBlur}
              onChange={(e) => {
                setForm({ ...form, phone: e.target.value });
                setDuplicateWarning(null);
              }}
              className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:border-brand"
              placeholder="Ej. 744 123 4567"
            />
          </div>

          {!duplicateWarning && (
            <div>
              <label className="text-xs font-medium text-gray-500">
                Origen
              </label>
              <input
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:border-brand"
                placeholder="Facebook, referido, walk-in..."
              />
            </div>
          )}

          {duplicateWarning && (
            <div>
              <label className="text-xs font-medium text-gray-500">
                Nuevo interés / motivo de contacto
              </label>
              <input
                value={form.interest}
                onChange={(e) => setForm({ ...form, interest: e.target.value })}
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:border-brand"
                placeholder="Ej. Servicio de mantenimiento"
              />
            </div>
          )}

          {!duplicateWarning && (
            <div>
              <label className="text-xs font-medium text-gray-500">Área</label>
              <select
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="w-full border border-gray-200 rounded-md px-3 py-2 text-sm mt-1 focus:outline-none focus:border-brand"
              >
                <option value="NUEVOS">Nuevos</option>
                <option value="SERVICIO">Citas de Servicio</option>
                <option value="OPERADOR">Operador</option>
                <option value="REFACCIONES">Refacciones</option>
                <option value="DIGITAL">Digital</option>
                <option value="COMONUEVOS">Comonuevos</option>
              </select>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          {duplicateWarning && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 text-sm">
              <p className="text-blue-700 font-medium">
                Este teléfono ya existe: {duplicateWarning.fullName} (hace{" "}
                {duplicateWarning.daysSince} días, {duplicateWarning.status})
              </p>
              <p className="text-blue-600 text-xs mt-1">
                No se creará un lead nuevo. Se agregará este contacto como
                seguimiento al historial del lead existente.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-brand text-white rounded-md hover:bg-[#e8543b] disabled:opacity-50"
            >
              {duplicateWarning && <ArrowRightCircle className="w-4 h-4" />}
              {creating
                ? "Guardando..."
                : duplicateWarning
                  ? "Registrar Seguimiento"
                  : "Crear Lead"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
