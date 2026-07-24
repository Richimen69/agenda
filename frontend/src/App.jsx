import { useEffect, useState } from "react";
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
import { TechnicianKiosk } from "@modules/live/pages/TechnicianKiosk";

export default function App() {
  const { authUser, setAuthUser, isCheckingAuth, handleLogout } = useAuth();
  const [participantSuffix] = useState(() =>
    Math.random().toString(36).slice(2, 8),
  );
  const {
    users,
    tickets,
    places,
    events,
    loading,
    fetchData,
    handleStatusChange,
    handleAddComment,
    myProjects,
  } = useAppData(authUser);

  useEffect(() => {
    if (authUser) fetchData();
  }, [authUser]);

  // =========================================================================
  // 1. INTERCEPCIÓN PÚBLICA (OMITIR LOGIN PARA CLIENTE Y TÉCNICO EN PRUEBAS)
  // =========================================================================
  const queryParams = new URLSearchParams(window.location.search);
  const role = queryParams.get("role"); // "technician", "client", "spectator" o "technician-kiosk"
  const room = queryParams.get("room"); // ID de la sesión
  const label = queryParams.get("label") || "Servicio";

  // -------------------------------------------------------------------------
  // KIOSCO DEL TÉCNICO: URL fija por dispositivo, SIN room y SIN login.
  // Ej: https://tudominio.com/?role=technician-kiosk&technicianId=abc123&name=Juan
  // El dispositivo se queda esperando y se autoconecta solo en cuanto el
  // asesor le asigna una sesión desde AdminLive. Va primero porque no
  // depende de "room" como el resto de los roles de abajo.
  // -------------------------------------------------------------------------
  const technicianId = queryParams.get("technicianId");
  if (role === "technician-kiosk" && technicianId) {
    return (
      <TechnicianKiosk
        technicianId={technicianId}
        participantName={queryParams.get("name") || "Técnico"}
      />
    );
  }

  if (
    room &&
    (role === "client" || role === "technician" || role === "spectator")
  ) {
    const isTechnician = role === "technician";
    const isSpectator = role === "spectator";

    let participantName = "Cliente";
    if (isTechnician) participantName = "Técnico";
    if (isSpectator) participantName = "Supervisor";

    return (
      <LiveRoom
        roomName={room}
        participantName={`${participantName} (${label}) #${participantSuffix}`}
        isTechnician={isTechnician}
        isSpectator={isSpectator}
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
                  onProjectsChange={fetchData}
                  places={places}
                  myProjects={myProjects}
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
