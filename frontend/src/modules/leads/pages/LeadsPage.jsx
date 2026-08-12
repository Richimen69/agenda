import { AllTable } from "../components/table/AllTable";
import { AuxTable } from "../components/table/AuxTable";
export default function LeadsPage({ leads, onLeadsChange, authUser, users }) {
  console.log(authUser);
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
      />
    </div>
  );
}
