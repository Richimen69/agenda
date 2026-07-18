import { useState } from 'react';
import { useLiveSessions } from '../hooks/useLiveSessions';
import { useServiceTypes } from '../hooks/useServiceTypes';
import { AdminLiveTabs } from './Tabs';
import { CreateSessionForm } from './CreateSessionForm';
import { ActiveSessionsTable } from './ActiveSessionsTable';
import { HistorySessionsTable } from './HistorySessionsTable';
import { ServiceStagesConfig } from './ServiceStagesConfig';
import { TechnicianDevices } from './TechnicianDevices';

export function AdminLive({ authUser, users, onSessionsChange }) {
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'active', 'history', 'config'

  const {
    activeSessions,
    finishedSessions,
    loading: sessionsLoading,
    fetchSessions,
    createSession,
    finishSession,
    deleteSession
  } = useLiveSessions({ onSessionsChange });

  const {
    serviceTypes,
    loading: serviceTypesLoading,
    fetchServiceTypes,
    createNewServiceType
  } = useServiceTypes();

  const loading = sessionsLoading || serviceTypesLoading;

  const refreshAll = () => {
    fetchSessions();
    fetchServiceTypes();
  };

  const handleCreate = (formData) => createSession(formData, authUser.id);

  const handleFinish = async (id) => {
    if (!confirm('¿Deseas finalizar el livestream?')) return;
    const result = await finishSession(id);
    if (!result.success) alert('Error: ' + result.error);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Deseas eliminar permanentemente esta sesión?')) return;
    const result = await deleteSession(id);
    if (!result.success) alert('Error: ' + result.error);
  };

  const handleCreateServiceType = (payload) => createNewServiceType(payload);

  return (
    <div className="w-full bg-[#f8f9fa] min-h-screen text-gray-800 p-2">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <span className="bg-red-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-1">
            Módulo Toyota Live
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transmisiones del Taller</h1>
        </div>
        <button
          onClick={refreshAll}
          className="mt-2 md:mt-0 bg-white border border-gray-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Refrescar Lista
        </button>
      </div>

      <AdminLiveTabs activeTab={activeTab} onChange={setActiveTab} activeCount={activeSessions.length} />

      {activeTab === 'create' && (
        <CreateSessionForm
          users={users}
          serviceTypes={serviceTypes}
          loading={loading}
          onSubmit={handleCreate}
          onSuccess={() => setActiveTab('active')}
        />
      )}

      {activeTab === 'active' && (
        <ActiveSessionsTable sessions={activeSessions} onFinish={handleFinish} />
      )}

      {activeTab === 'history' && (
        <HistorySessionsTable sessions={finishedSessions} onDelete={handleDelete} />
      )}

      {activeTab === 'config' && (
        <ServiceStagesConfig
          serviceTypes={serviceTypes}
          loading={loading}
          onCreateServiceType={handleCreateServiceType}
        />
      )}

      {activeTab === 'devices' && (
        <TechnicianDevices users={users} />
      )}
    </div>
  );
}