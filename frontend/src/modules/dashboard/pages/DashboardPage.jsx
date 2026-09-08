import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { LeadsDashboard } from "../../leads/pages/LeadsDashboard";
import GlobalDashboard from "../../programas/components/dashboard/GlobalDashboard";
export default function DashboardPage({ authUser }) {
  const roles = authUser?.moduleRoles || [];
  const isAdmin = authUser?.role === "ADMIN";
  const canViewLeads = isAdmin || roles.some((rol) => rol.startsWith("LEADS"));
  const isDirector = isAdmin || roles.includes("DIRECCION");
  return (
    <div className="space-y-12 animate-fade-in">
      {isDirector && <GlobalDashboard />}
      {canViewLeads && <LeadsDashboard />}
    </div>
  );
}
