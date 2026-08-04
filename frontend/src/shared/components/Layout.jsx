import { useState } from "react";
import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Shield,
  LogOut,
  Calendar,
  ListChecks,
  Radio,
  Link2,
  ChartBar,
  FolderKanban,
  Sheet,
  Menu,
  X
} from "lucide-react";
import ToyotaLogo from "../../../public/toyota.svg";

export default function Layout({ authUser, onLogout }) {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para cerrar el menú en móviles al hacer clic en un enlace
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <div className="flex h-screen bg-layout-app font-sans overflow-hidden">
      
      {/* OVERLAY PARA MÓVILES */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden transition-opacity"
          onClick={closeMobileMenu}
        />
      )}

      {/* NAVEGACIÓN LATERAL (SIDEBAR) */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 flex flex-col shadow-sm transform transition-transform duration-300 ease-in-out 
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"} 
        md:relative md:translate-x-0`}
      >
        {/* Logo y Botón Cerrar (Móvil) */}
        <div className="p-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand p-1 rounded-lg flex items-center justify-center shadow-md">
              <img
                src={ToyotaLogo}
                alt="Logo de Toyota"
                width="60"
                height="60"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">
              Kyojin
            </h1>
          </div>
          <button 
            className="md:hidden text-gray-500 hover:text-gray-900"
            onClick={closeMobileMenu}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links de Navegación */}
        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          <Link
            to="/"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/" || location.pathname.startsWith("/dashboard") ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ChartBar className="w-5 h-5" /> Dashboard
          </Link>
          <Link
            to="/proyectos"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/proyectos" || location.pathname.startsWith("/proyectos") ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <FolderKanban className="w-5 h-5" /> Proyectos
          </Link>

          <Link
            to="/tareas"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/tareas" || location.pathname.startsWith("/tareas") ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:text-gray-900"}`}
          >
            <ListChecks className="w-5 h-5" /> Tareas
          </Link>
          <Link
            to="/agenda"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/agenda" ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Calendar className="w-5 h-5" /> Agenda
          </Link>
          
          <Link
            to="/live"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/live" ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Radio className="w-5 h-5" /> Live
          </Link>

          <Link
            to="/marketing"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/marketing" ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Link2 className="w-5 h-5" /> Marketing
          </Link>

          <Link
            to="/leads"
            onClick={closeMobileMenu}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/leads" ? "bg-layout-hover text-content-main shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
          >
            <Sheet className="w-5 h-5" /> Leads
          </Link>

          {authUser?.role === "ADMIN" && (
            <Link
              to="/admin"
              onClick={closeMobileMenu}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${location.pathname === "/admin" ? "bg-brand-subtle text-brand shadow-sm" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"}`}
            >
              <Shield className="w-5 h-5" /> Administración
            </Link>
          )}
        </nav>

        {/* Perfil de Usuario (Abajo) */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl border border-gray-100">
            <div className="w-9 h-9 rounded-full bg-indigo-200 text-content-main flex items-center justify-center font-bold text-sm shadow-inner shrink-0">
              {authUser?.name?.charAt(0) || "U"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-bold text-gray-900 truncate">
                {authUser?.name || "Usuario"}
              </p>
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">
                {authUser?.role || "GUEST"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="text-gray-400 hover:text-red-500 transition-colors cursor-pointer shrink-0"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </aside>

      {/* ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* HEADER MÓVIL (Solo visible en pantallas pequeñas) */}
        <header className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand p-1 rounded-md flex items-center justify-center">
              <img
                src={ToyotaLogo}
                alt="Logo"
                width="40"
                height="40"
                style={{ filter: "brightness(0) invert(1)" }}
              />
            </div>
            <h1 className="text-lg font-bold text-gray-900">Kyojin</h1>
          </div>
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>
        </header>

        {/* CONTENEDOR DE RUTAS */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-10xl mx-auto">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}