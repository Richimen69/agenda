import React, { useState } from "react";
import { AllTable } from "../components/table/AllTable";
import { AuxTable } from "../components/table/AuxTable";
import { Star } from "lucide-react";

export default function LeadsPage({
  leads,
  leadsMonth,
  fetchLeadsByMonth,
  onLeadsChange,
  authUser,
  users,
}) {
  const [showHighlighted, setShowHighlighted] = useState(false);

  const displayedLeads = showHighlighted
    ? leads.filter((lead) => lead.isHighlighted === true)
    : leads;

  const TableComponent = authUser.moduleRoles.includes("LEADS_ADMIN")
    ? AllTable
    : AuxTable;

  return (
    <div className="animate-fade-in w-full">
      <div className="flex items-center gap-2 px-4 lg:px-8">
        <button
          onClick={() => setShowHighlighted(false)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer ${
            !showHighlighted
              ? "bg-brand text-white shadow-md transform scale-105"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          Todos los Leads
        </button>
        <button
          onClick={() => {
            setShowHighlighted(true);
            fetchLeadsByMonth("all", "");
          }}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ease-in-out cursor-pointer ${
            showHighlighted
              ? "bg-yellow-400 text-white shadow-md transform scale-105"
              : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700"
          }`}
        >
          <Star
            className={`w-4 h-4 transition-all duration-300 ease-in-out ${
              showHighlighted ? "fill-white text-yellow-400" : "text-gray-500"
            }`}
          />
          En seguimiento
        </button>
      </div>

      <div
        key={showHighlighted ? "destacados" : "todos"}
        className="animate-fade-in"
      >
        <TableComponent
          leads={displayedLeads}
          onLeadsChange={onLeadsChange}
          user={authUser}
          users={users}
          selectedMonth={leadsMonth}
          onMonthChange={(newMonth) => fetchLeadsByMonth(newMonth, "")}
          onSearch={fetchLeadsByMonth}
        />
      </div>
    </div>
  );
}
