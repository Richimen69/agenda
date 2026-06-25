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
import { sileo, Toaster } from "sileo";

export default function App() {
  const { authUser, setAuthUser, isCheckingAuth, handleLogout } = useAuth();
  const {
    users,
    tickets,
    events,
    loading,
    fetchData,
    handleStatusChange,
    handleAddComment,
  } = useAppData(authUser);

  useEffect(() => {
    if (authUser) fetchData();
  }, [authUser]);

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
            <Route
              index
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
              element={<AgendaPage events={events} authUser={authUser} />}
            />

            <Route
              path="admin"
              element={
                <AdminPage
                  authUser={authUser}
                  users={users}
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
