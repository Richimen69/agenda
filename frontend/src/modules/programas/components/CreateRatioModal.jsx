import { useState } from "react";
import { X, Calculator, CheckSquare, Square } from "lucide-react";
import { createProjectRatio } from "../services/projects.api";

export default function CreateRatioModal({
  isOpen,
  onClose,
  projectId,
  availableKpis = [],
  onSuccess,
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("");

  const [numerators, setNumerators] = useState([]);
  const [denominators, setDenominators] = useState([]);

  if (!isOpen) return null;

  const toggleSelection = (kpiName, list, setList) => {
    setList((prev) =>
      prev.includes(kpiName)
        ? prev.filter((n) => n !== kpiName)
        : [...prev, kpiName],
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (numerators.length === 0 || denominators.length === 0) {
      return alert(
        "Selecciona al menos un KPI para el numerador y uno para el denominador.",
      );
    }

    setIsSubmitting(true);
    try {
      // Mandamos los arreglos al backend
      await createProjectRatio(projectId, {
        name,
        unit,
        numeratorNames: numerators,
        denominatorNames: denominators,
      });
      setName("");
      setUnit("");
      setNumerators([]);
      setDenominators([]);
      onSuccess();
      onClose();
    } catch (error) {
      alert("Error al crear la métrica calculada.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mini-componente para pintar la lista de checkboxes
  const KpiSelector = ({ title, selectedList, setList }) => (
    <div className="flex-1 bg-white border border-layout-border rounded-lg p-3">
      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {title}
      </label>
      <div className="max-h-32 overflow-y-auto space-y-1 custom-scrollbar">
        {availableKpis.map((kpi) => {
          const isSelected = selectedList.includes(kpi);
          return (
            <label
              key={kpi}
              className="flex items-center gap-2 p-1.5 hover:bg-slate-50 cursor-pointer rounded"
            >
              <input
                type="checkbox"
                className="hidden"
                checked={isSelected}
                onChange={() => toggleSelection(kpi, selectedList, setList)}
              />
              {isSelected ? (
                <CheckSquare className="w-4 h-4 text-brand" />
              ) : (
                <Square className="w-4 h-4 text-slate-300" />
              )}
              <span
                className={`text-xs ${isSelected ? "font-bold text-slate-800" : "text-slate-600"}`}
              >
                {kpi}
              </span>
            </label>
          );
        })}
        {availableKpis.length === 0 && (
          <p className="text-xs text-slate-400">No hay KPIs disponibles.</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl flex flex-col border border-layout-border">
        <div className="flex justify-between items-center px-6 py-4 border-b border-layout-border bg-slate-50">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-brand" />
            <h2 className="text-lg font-bold text-slate-800">
              Crear Métrica de Eficiencia
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-content-muted hover:text-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          id="create-ratio-form"
          onSubmit={handleSubmit}
          className="p-6 space-y-5"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="col-span-2">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Nombre del Ratio
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ej. Costo por Prospecto Total"
                className="w-full border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-brand outline-none"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-sm font-semibold text-slate-700 mb-1">
                Unidad
              </label>
              <input
                type="text"
                required
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                placeholder="Ej. MXN/ud, %"
                className="w-full border border-layout-border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-brand outline-none"
              />
            </div>
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-layout-border">
            <p className="text-sm font-semibold text-slate-700 mb-3">
              Fórmula Matemática (Selecciona uno o varios)
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <KpiSelector
                title="Dividir esto (Suma)"
                selectedList={numerators}
                setList={setNumerators}
              />
              <div className="flex items-center justify-center font-bold text-slate-300 text-xl">
                ÷
              </div>
              <KpiSelector
                title="Entre esto (Suma)"
                selectedList={denominators}
                setList={setDenominators}
              />
            </div>
          </div>
        </form>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-layout-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-slate-600 border border-layout-border rounded-md"
          >
            Cancelar
          </button>
          <button
            form="create-ratio-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-slate-800 rounded-md"
          >
            Crear Métrica
          </button>
        </div>
      </div>
    </div>
  );
}
