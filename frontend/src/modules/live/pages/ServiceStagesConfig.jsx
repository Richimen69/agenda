import { ServiceTypesList } from './ServiceTypesList';
import { ServiceTypeForm } from './ServiceTypeForm';

export function ServiceStagesConfig({ serviceTypes, loading, onCreateServiceType }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-6">
        <h2 className="text-base font-bold text-gray-900 mb-2">Servicios y Etapas Configuradas en Kyojin</h2>
        <ServiceTypesList serviceTypes={serviceTypes} />
      </div>

      <ServiceTypeForm loading={loading} onSubmit={onCreateServiceType} />
    </div>
  );
}