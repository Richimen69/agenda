import { Outlet, Link, useLocation } from "react-router-dom";
import { LayoutDashboard, Shield, LogOut, Calendar, ListChecks  } from "lucide-react";

export default function Layout({ authUser, onLogout }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-[#f8f9fa] font-sans overflow-hidden">
      {/* NAVEGACIÓN LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <Calendar className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Workspace
          </h1>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/" || location.pathname.startsWith("/tickets") ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <ListChecks className="w-5 h-5" /> Proyectos
          </Link>
          <Link
            to="/agenda"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/agenda" ? "bg-indigo-50 text-indigo-700 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Calendar className="w-5 h-5" /> Agenda
          </Link>

          {authUser?.role === "ADMIN" && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/admin" ? "bg-purple-50 text-purple-700 shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Shield className="w-5 h-5" /> Administración
            </Link>
          )}
        </nav>

        {/* Perfil de Usuario (Abajo) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-indigo-200 text-indigo-700 flex items-center justify-center font-bold text-sm shadow-inner">
              {authUser?.name.charAt(0)}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                {authUser?.name}
              </p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                {authUser?.role}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 overflow-y-auto p-8">
        <div className="max-w-7xl mx-auto">
          {/* Aquí React Router inyectará la pantalla correspondiente */}
          <Outlet />
        </div>
      </main>
    </div>
  );
}
