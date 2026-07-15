import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import { useAuth } from "./hooks/useAuth";
import { useAppData } from "./hooks/useAppData";

import Login from "@modules/auth/pages/Login";
import Layout from "@shared/components/Layout";
import WorkspacePage from "./modules/proyectos/pages/WorkspacePage";
import TicketDetailPage from "./modules/proyectos/pages/TicketDetailPage";
import AdminPage from "@modules/admin/pages/AdminPage";
import AgendaPage from "./modules/agenda/pages/AgendaPage";
import MarketingPage from "@modules/marketing/pages/MarketingPage";
import ProyectosPage from "@modules/programas/pages/ProyectosPage";
import DashboardPage from "@modules/dashboard/pages/DashboardPage";
import { sileo, Toaster } from "sileo";

// NUEVAS IMPORTACIONES DEL MÓDULO LIVE
import { AdminLive } from "@modules/live/pages/AdminLive";
import { LiveRoom } from "@modules/live/components/LiveRoom";

export default function App() {
  const { authUser, setAuthUser, isCheckingAuth, handleLogout } = useAuth();
  const {
    users,
    tickets,
    places,
    events,
    loading,
    fetchData,
    handleStatusChange,
    handleAddComment,
  } = useAppData(authUser);

  useEffect(() => {
    if (authUser) fetchData();
  }, [authUser]);

  // =========================================================================
  // 1. INTERCEPCIÓN PÚBLICA (OMITIR LOGIN PARA CLIENTE Y TÉCNICO EN PRUEBAS)
  // =========================================================================
  const queryParams = new URLSearchParams(window.location.search);
  const role = queryParams.get("role"); // "technician" o "client"
  const room = queryParams.get("room"); // ID de la sesión (UUID)
  const label = queryParams.get("label") || "Servicio";

  // Si tiene sala y rol, abre el reproductor sin validaciones de auth para pruebas rápidas
  if (room && (role === "client" || role === "technician")) {
    const isTechnician = role === "technician";
    const participantName = isTechnician ? "Técnico" : "Cliente";

    return (
      <LiveRoom 
        roomName={room} 
        participantName={`${participantName} (${label})`} 
        isTechnician={isTechnician} 
      />
    );
  }

  // =========================================================================
  // 2. SEGURIDAD DEL SISTEMA KAIZEN (Solo personal autenticado)
  // =========================================================================
  if (isCheckingAuth) return <div className="min-h-screen bg-[#f8f9fa]" />;
  if (!authUser) return <Login onLoginSuccess={setAuthUser} />;

  return (
    <>
      <Toaster position="top-center" />
      <BrowserRouter>
        <Routes>
          
          {/* RUTA INTERNA: Consola de Transmisión del Técnico dentro de tu Layout */}
          <Route
            path="/"
            element={<Layout authUser={authUser} onLogout={handleLogout} />}
          >
            {/* Panel de administración del asesor */}
            <Route
              path="live"
              element={
                <AdminLive
                  authUser={authUser}
                  users={users} // Reutiliza tus usuarios para asignarlos a las sesiones
                  onSessionsChange={fetchData}
                />
              }
            />

            {/* Consola técnica del taller */}
            <Route
              path="live-tech"
              element={
                <LiveRoom 
                  roomName={room} 
                  participantName={`Técnico (${label})`} 
                  isTechnician={true} 
                />
              }
            />

            <Route
              path="tareas"
              element={
                loading && tickets.length === 0 ? (
                  <p className="text-center text-gray-500 py-10">
                    Cargando tu espacio de trabajo...
                  </p>
                ) : (
                  <WorkspacePage
                    tickets={tickets}
                    users={users}
                    events={events}
                    authUser={authUser}
                    fetchData={fetchData}
                  />
                )
              }
            />

            <Route
              path="tickets/:id"
              element={
                <TicketDetailPage
                  tickets={tickets}
                  authUser={authUser}
                  users={users}
                  onStatusChange={handleStatusChange}
                  onAddComment={handleAddComment}
                  onDelete={fetchData}
                  onUpdate={fetchData}
                  fetchData={fetchData}
                />
              }
            />
            <Route
              path="agenda"
              element={
                <AgendaPage
                  events={events}
                  authUser={authUser}
                  users={users}
                  onEventsChange={fetchData}
                />
              }
            />
            <Route
              index
              element={
                <DashboardPage
                  events={events}
                  authUser={authUser}
                  users={users}
                  onEventsChange={fetchData}
                />
              }
            />
            <Route
              path="proyectos"
              element={
                <ProyectosPage
                  events={events}
                  authUser={authUser}
                  users={users}
                  onEventsChange={fetchData}
                  places={places}
                />
              }
            />

            <Route
              path="admin"
              element={
                <AdminPage
                  authUser={authUser}
                  users={users}
                  places={places}
                  onUsersChange={fetchData}
                />
              }
            />
            <Route
              path="marketing"
              element={<MarketingPage authUser={authUser} />}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}