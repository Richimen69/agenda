import { useState } from 'react';

const EMPTY_FORM = {
  roomName: '',
  customerName: '',
  customerPhone: '',
  vehicleModel: '',
  technicianId: ''
};

/**
 * onSubmit(formData) debe devolver { success, error? } (viene del hook
 * useLiveSessions.createSession). onSuccess se dispara después del alert
 * de éxito, útil para que el padre cambie de tab.
 */
export function CreateSessionForm({ users, loading, onSubmit, onSuccess }) {
  const [formData, setFormData] = useState(EMPTY_FORM);

  const updateField = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.roomName || !formData.customerName) {
      alert('Campos obligatorios incompletos');
      return;
    }

    const result = await onSubmit(formData);
    if (result.success) {
      alert('Sesión registrada exitosamente.');
      setFormData(EMPTY_FORM);
      if (onSuccess) onSuccess();
    } else {
      alert('Error al registrar sesión: ' + result.error);
    }
  };

  return (
    <div className="max-w-md bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="text-base font-bold mb-4 text-gray-900">Registrar Nuevo Monitoreo</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Identificador / Placa (Obligatorio)
          </label>
          <input
            type="text"
            required
            placeholder="Ej: PLACA-XYZ123"
            value={formData.roomName}
            onChange={updateField('roomName')}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Nombre del Cliente (Obligatorio)
          </label>
          <input
            type="text"
            required
            placeholder="Ej: Sr. Alejandro"
            value={formData.customerName}
            onChange={updateField('customerName')}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            WhatsApp de Notificación
          </label>
          <input
            type="tel"
            placeholder="Ej: 5215512345678"
            value={formData.customerPhone}
            onChange={updateField('customerPhone')}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Modelo del Auto (Opcional)
          </label>
          <input
            type="text"
            placeholder="Ej: Toyota Hilux 2024"
            value={formData.vehicleModel}
            onChange={updateField('vehicleModel')}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600"
          />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase mb-1.5">
            Asignar Técnico Operativo
          </label>
          <select
            value={formData.technicianId}
            onChange={updateField('technicianId')}
            className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-red-600 cursor-pointer"
          >
            <option value="">Seleccionar del Personal (Opcional)</option>
            {users && users.map((user) => (
              <option key={user.id} value={user.id}>{user.name}</option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white font-bold py-2.5 rounded-xl transition-colors cursor-pointer text-sm"
        >
          {loading ? 'Procesando...' : 'Crear y Notificar'}
        </button>
      </form>
    </div>
  );
}