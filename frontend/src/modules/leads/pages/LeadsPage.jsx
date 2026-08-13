import { AllTable } from "../components/table/AllTable";
import { AuxTable } from "../components/table/AuxTable";
export default function LeadsPage({
  leads,
  leadsMonth,
  fetchLeadsByMonth,
  onLeadsChange,
  authUser,
  users,
}) {
  const TableComponent = authUser.moduleRoles.includes("LEADS_ADMIN")
    ? AllTable
    : AuxTable;
  return (
    <div className="space-y-12 animate-fade-in w-full">
      <TableComponent
        leads={leads}
        onLeadsChange={onLeadsChange}
        user={authUser}
        users={users}
        selectedMonth={leadsMonth}
        onMonthChange={(newMonth) => fetchLeadsByMonth(newMonth, "")}
        onSearch={fetchLeadsByMonth}
      />
    </div>
  );
}
