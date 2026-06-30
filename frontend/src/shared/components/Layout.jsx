import { Outlet, Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Shield,
  LogOut,
  Calendar,
  ListChecks,
  Radio,
  Link2,
  ChartBar,
} from "lucide-react";
import ToyotaLogo from "../../../public/toyota.svg";

export default function Layout({ authUser, onLogout }) {
  const location = useLocation();

  return (
    <div className="flex h-screen bg-layout-app font-sans overflow-hidden">
      {/* NAVEGACIÓN LATERAL (SIDEBAR) */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm z-10">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-brand p-1 rounded-lg flex items-center justify-center shadow-md">
            <img
              src={ToyotaLogo}
              alt="Logo de Toyota"
              width="60"
              height="60"
              // Esto convierte la imagen a blanco sin importar el color original
              style={{ filter: "brightness(0) invert(1)" }}
            />
          </div>
          <h1 className="text-xl font-bold text-gray-900 tracking-tight">
            Kyojin
          </h1>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 space-y-2 mt-4">
          <Link
            to="/"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/" || location.pathname.startsWith("/tickets") ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500  hover:text-gray-900"}`}
          >
            <ListChecks className="w-5 h-5" /> Proyectos
          </Link>
          <Link
            to="/agenda"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/agenda" ? "bg-layout-hover ext-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Calendar className="w-5 h-5" /> Agenda
          </Link>
          {/*
          <Link
            to="/crm"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/crm" ? "bg-layout-hover ext-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <ChartBar className="w-5 h-5" /> CRM
          </Link>

          <Link
            to="/kaizen"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/kaizen" ? "bg-layout-hover ext-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Radio className="w-5 h-5" /> Kaizen
          </Link> */}

          <Link
            to="/marketing"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/marketing" ? "bg-layout-hover ext-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Link2 className="w-5 h-5" /> Marketing
          </Link>

          {authUser?.role === "ADMIN" && (
            <Link
              to="/admin"
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/admin" ? "bg-brand-subtle text-brand shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Shield className="w-5 h-5" /> Administración
            </Link>
          )}
        </nav>

        {/* Perfil de Usuario (Abajo) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-indigo-200 ext-content-main flex items-center justify-center font-bold text-sm shadow-inner">
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
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer"
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
