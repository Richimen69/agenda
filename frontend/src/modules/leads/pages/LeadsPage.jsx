import { AllTable } from "../components/table/AllTable";
export default function LeadsPage({ leads, onLeadsChange, authUser, users }) {
  return (
    <div className="space-y-12 animate-fade-in w-full">
      <AllTable leads={leads} onLeadsChange={onLeadsChange} user={authUser} users={users}/>
    </div>
  );
}
