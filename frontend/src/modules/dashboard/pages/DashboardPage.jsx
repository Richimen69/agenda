import { useNavigate } from "react-router-dom";
import { Sparkles } from "lucide-react";
import { LeadsDashboard } from "../../leads/pages/LeadsDashboard";
export default function DashboardPage() {
  return (
    <div className="space-y-12 animate-fade-in">
      <LeadsDashboard />
    </div>
  );
}
