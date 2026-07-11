import { useState } from 'react';
import { useLiveSessions } from '../hooks/useLiveSessions';
import { AdminLiveTabs } from './Tabs';
import { CreateSessionForm } from './CreateSessionForm';
import { ActiveSessionsTable } from './ActiveSessionsTable';
import { HistorySessionsTable } from './HistorySessionsTable';

export function AdminLive({ authUser, users, onSessionsChange }) {
  const [activeTab, setActiveTab] = useState('create');

  const {
    activeSessions,
    finishedSessions,
    loading,
    fetchSessions,
    createSession,
    finishSession,
    deleteSession
  } = useLiveSessions({ onSessionsChange });

  const handleCreate = (formData) => createSession(formData, authUser.id);

  const handleFinish = async (id) => {
    if (!confirm('¿Deseas finalizar el livestream?')) return;
    const result = await finishSession(id);
    if (!result.success) alert('Error: ' + result.error);
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Deseas eliminar permanentemente esta sesión del historial?')) return;
    const result = await deleteSession(id);
    if (!result.success) alert('Error: ' + result.error);
  };

  return (
    <div className="w-full bg-white min-h-screen text-gray-800 p-10 rounded-2xl shadow-sm">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-gray-200 pb-4 mb-6">
        <div>
          <span className="bg-red-600 text-white font-bold text-[10px] px-3 py-1 rounded-full uppercase tracking-wider block w-max mb-1">
            Módulo Toyota Live
          </span>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Transmisiones del Taller</h1>
        </div>
        <button
          onClick={fetchSessions}
          className="mt-2 md:mt-0 bg-white border border-gray-300 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Refrescar Lista
        </button>
      </div>

      <AdminLiveTabs activeTab={activeTab} onChange={setActiveTab} activeCount={activeSessions.length} />

      {activeTab === 'create' && (
        <CreateSessionForm
          users={users}
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
    </div>
  );
}