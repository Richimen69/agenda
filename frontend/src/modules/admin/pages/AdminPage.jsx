import { Navigate } from "react-router-dom";
import { useState } from "react";
import AdminPanel from "@modules/admin/components/AdminPanel";
import PlacePanel from "@modules/admin/components/PlacePanel";
import { Trash2, UserPlus, UserRoundPlus, Network } from "lucide-react";

export default function AdminPage({ authUser, users, onUsersChange, places }) {
  const [activeTab, setActiveTab] = useState("profile");
  const [role, setRole] = useState("");

  if (authUser.role !== "ADMIN") return <Navigate to="/" />;

  return (
    <div className="space-y-12 animate-fade-in">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Panel de Administración
        </h2>
        <p className="text-gray-500 text-sm">
          Gestiona los accesos de tu equipo.
        </p>
      </div>
      <div className="flex items-center relative transition-all duration-450 ease-in-out w-auto">
        <article className="w-xs ease-in-out duration-500 left-0 rounded-lg flex shadow-sm shadow-black/15 bg-white">
          <label
            className="has-checked:shadow-lg relative w-full h-10 p-4 ease-in-out duration-300 border-solid border-black/10 has-checked:border group flex flex-row gap-3 items-center justify-center text-black rounded-lg"
            htmlFor="profile"
          >
            <input
              id="profile"
              name="path"
              type="radio"
              className="hidden peer/expand"
              checked={activeTab === "profile"}
              onChange={() => setActiveTab("profile")}
            />
            <div className="peer-hover/expand:scale-125 peer-hover/expand:text-brand peer-hover/expand:fill-brand peer-checked/expand:text-brand peer-checked/expand:fill-brand text-2xl peer-checked/expand:scale-125 ease-in-out duration-300 cursor-pointer w-full h-full flex items-center justify-center gap-1">
              <UserPlus className="w-4 h-4" />
              <span className="text-xs">Usuarios</span>
            </div>
          </label>
          <label
            className="has-checked:shadow-lg relative w-full h-10 p-4 ease-in-out duration-300 border-solid border-black/10 has-checked:border group flex flex-row gap-3 items-center justify-center text-black rounded-lg"
            htmlFor="place"
          >
            <input
              id="place"
              name="path"
              type="radio"
              className="hidden peer/expand"
              checked={activeTab === "place"}
              onChange={() => setActiveTab("place")}
            />
            <div className="peer-hover/expand:scale-125 peer-hover/expand:text-brand peer-hover/expand:fill-brand peer-checked/expand:text-brand peer-checked/expand:fill-brand text-2xl peer-checked/expand:scale-125 ease-in-out duration-300 cursor-pointer w-full h-full flex items-center justify-center gap-1">
              <Network className="w-4 h-4" />
              <span className="text-xs">Departamentos</span>
            </div>
          </label>
        </article>
      </div>
      {activeTab === "profile" ? (
        <AdminPanel
          users={users}
          onUsersChange={onUsersChange}
          places={places}
        />
      ) : (
        <PlacePanel
          users={users}
          onUsersChange={onUsersChange}
          places={places}
        />
      )}
    </div>
  );
}
