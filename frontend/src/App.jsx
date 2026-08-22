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
import LeadsPage from "./modules/leads/pages/LeadsPage";
import { sileo, Toaster } from "sileo";
import ProjectDetailPage from "./modules/programas/pages/ProjectDetailPage";

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
    leads,
    leadsMonth,
    fetchLeadsByMonth,
  } = useAppData(authUser);

  useEffect(() => {
    if (authUser) fetchData();
  }, [authUser]);

  const queryParams = new URLSearchParams(window.location.search);
  const role = queryParams.get("role");
  const room = queryParams.get("room");
  const label = queryParams.get("label") || "Servicio";

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
                  users={users}
                  onSessionsChange={fetchData}
                />
              }
            />
            <Route
              path="/proyectos/:id"
              element={<ProjectDetailPage creatorId={authUser.id} />}
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
              path="leads"
              element={
                <LeadsPage
                  authUser={authUser}
                  leads={leads}
                  users={users}
                  onLeadsChange={fetchData}
                  leadsMonth={leadsMonth}
                  fetchLeadsByMonth={fetchLeadsByMonth}
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
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}
