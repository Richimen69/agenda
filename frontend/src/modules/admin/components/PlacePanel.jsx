import { useState } from "react";
import { createUser, deleteUser } from "../services/users.api";
import { Trash2, UserPlus, CircleAlert, Network, Check } from "lucide-react";
import { sileo } from "sileo";
import { createPlace } from "../services/places.api";

export default function PlacePanel({ users, onUsersChange, places }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArea, setIsArea] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await createPlace({
        name,
        parentId: role || null,
      });
      if (result.success) {
        sileo.success({
          title: "Departamento Creado",
          description: name + " " + "Creado correctamente",
          fill: "#D8F3DC",
          styles: {
            title: "text-black/75!",
            description: "text-black/75!",
            badge: "bg-white!",
          },
        });
        setName("");
        onUsersChange();
      } else {
        sileo.error({
          title: "Error",
          description: result.error,
          fill: "#EB0A1E",
          icon: <CircleAlert className="size-4.5" />,
          styles: {
            title: "text-white!",
            description: "text-white!",
            badge: "bg-white!",
          },
        });
      }
    } catch (error) {
      alert("Error al crear departamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORMULARIO CREAR DEPARTAMENTO */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Network className="w-5 h-5 text-brand" /> Nuevo Departamento
          </h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <input
              type="text"
              placeholder="Ej. Sistemas"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm"
            />
            <div className="flex gap-2 items-center ml-2">
              <span className="text-sm font-medium text-gray-700">Area</span>
              <label
                htmlFor="hr"
                className="flex flex-row items-center gap-2.5 dark:text-white light:text-black cursor-pointer"
              >
                <input
                  id="hr"
                  type="checkbox"
                  checked={isArea}
                  onChange={(e) => setIsArea(e.target.checked)}
                  className="peer hidden"
                />
                <div
                  htmlFor="hr"
                  className="h-5 w-5 flex rounded-md border border-[#a2a1a833] light:bg-[#e8e8e8] dark:bg-white peer-checked:bg-brand transition"
                >
                  <Check className="size-4.5 text-white m-auto" />
                </div>
              </label>
            </div>
            {isArea && (
              <div className="flex flex-col gap-2 ml-2">
                <span className="text-sm font-medium text-gray-700">
                  Departamento
                </span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold cursor-pointer"
                >
                  <option value="">Selecciona un departamento</option>
                  {places.map((depto) => (
                    <option key={depto.id} value={depto.id}>
                      {depto.nombre}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover cursor-pointer transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting
                ? "Creando..."
                : isArea
                  ? "Crear Area"
                  : "Crear Departamento"}
            </button>
          </form>
        </div>

        {/* LISTA DE DEPARTAMENTOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Departamentos Registrados
          </h3>
          <div className="space-y-3">
            {places.map((place) => (
              <div
                key={place.id}
                className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-gray-900">
                    {place.name}
                  </span>
                  {place.children && place.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {place.children.map((hijo) => hijo.name).join(", ")}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
