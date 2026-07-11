const TABS = [
  { key: 'create', label: 'Nueva Sesión' },
  { key: 'active', label: 'Sesiones Activas' },
  { key: 'history', label: 'Historial' }
];

export function AdminLiveTabs({ activeTab, onChange, activeCount }) {
  return (
    <div className="flex border-b border-gray-200 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onChange(tab.key)}
          className={`pb-3 px-4 cursor-pointer font-semibold text-sm border-b-2 relative ${
            activeTab === tab.key
              ? 'border-red-600 text-red-600'
              : 'border-transparent text-gray-400 hover:text-gray-600'
          }`}
        >
          {tab.label}
          {tab.key === 'active' && ` (${activeCount})`}
        </button>
      ))}
    </div>
  );
}