import { LogOut } from 'lucide-react';

export default function Header({ activeUser, onLogout }) {
  return (
    <header className="flex justify-between items-end">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Workspace</h1>
        <p className="text-gray-600">Gestion de Proyectos y Notificaciones</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-sm text-gray-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-200">
          Hola, <span className="font-bold text-indigo-600">{activeUser?.name}</span>
        </div>
        <button 
          onClick={onLogout}
          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
          title="Cerrar Sesion"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}