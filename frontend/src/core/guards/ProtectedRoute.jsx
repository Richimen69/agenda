import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export const ProtectedRoute = () => {
  const { authUser, isCheckingAuth } = useAuth();

  if (isCheckingAuth) return <div className="loading-spinner" />;
  if (!authUser) return <Navigate to="/login" replace />;

  return <Outlet />; // Aquí se renderizarán las rutas protegidas
};