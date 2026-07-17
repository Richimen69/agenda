import { useState } from 'react';

const DEFAULT_STAGES = ['Recepción', 'Inspección', 'Listo'];

/**
 * onSubmit({ name, description, stages }) debe devolver { success, error? }
 * (viene del hook useServiceTypes.createNewServiceType).
 */
export function ServiceTypeForm({ loading, onSubmit }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stagesList, setStagesList] = useState(DEFAULT_STAGES);

  const resetForm = () => {
    setName('');
    setDescription('');
    setStagesList(DEFAULT_STAGES);
  };

  const handleAddStageField = () => {
    setStagesList((prev) => [...prev, '']);
  };

  const handleStageNameChange = (index, value) => {
    setStagesList((prev) => prev.map((s, i) => (i === index ? value : s)));
  };

  const handleRemoveStageField = (index) => {
    if (stagesList.length <= 1) {
      alert('Un servicio debe tener al menos una etapa');
      return;
    }
    setStagesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const filteredStages = stagesList.filter((s) => s.trim() !== '');
    if (!name || filteredStages.length === 0) {
      alert('El nombre del servicio y al menos una etapa válida son obligatorios');
      return;
    }

    const result = await onSubmit({ name, description, stages: filteredStages });
    if (result.success) {
      alert('¡Nuevo flujo de servicio parametrizado con éxito!');
      resetForm();
    } else {
      alert('Error al guardar parametrización: ' + result.error);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm self-start">
      <h2 className="text-base font-bold mb-4 text-gray-900">Parametrizar Nuevo Servicio</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Nombre del Servicio (Ej: Alineación y Balanceo)
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Hojalatería y Pintura"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">Descripción Breve (Opcional)</label>
          <textarea
            rows="2"
            placeholder="Ej: Reparación de lámina y pintura de piezas"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex justify-between items-center mb-3">
            <label className="text-xs font-bold text-gray-700 uppercase">Configurar Etapas Secuenciales</label>
            <button
              type="button"
              onClick={handleAddStageField}
              className="text-xs bg-red-50 text-red-600 font-bold px-2.5 py-1 rounded-lg border border-red-100 hover:bg-red-100 transition-colors"
            >
              + Añadir Etapa
            </button>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {stagesList.map((stageName, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {index + 1}
                </div>
                <input
                  type="text"
                  required
                  placeholder="Ej: Recepción o Reparación"
                  value={stageName}
                  onChange={(e) => handleStageNameChange(index, e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-1.5 text-xs text-gray-900 focus:outline-none focus:border-red-600"
                />
                <button
                  type="button"
                  onClick={() => handleRemoveStageField(index)}
                  className="text-gray-400 hover:text-red-600 font-bold text-sm px-1 cursor-pointer"
                  title="Eliminar etapa"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
        >
          {loading ? 'Guardando...' : 'Guardar y Parametrizar'}
        </button>
      </form>
    </div>
  );
}