import { useState } from "react";
import { Trash2, UserPlus, CircleAlert, Network, Check, Pencil, X } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { sileo } from "sileo";
import { createPlace, updatePlace } from "../services/places.api"; // Importamos updatePlace

const AVAILABLE_ICONS = [
  { name: "Folder", label: "Carpeta (Por defecto)" },
  { name: "Monitor", label: "Sistemas / TI" },
  { name: "Wrench", label: "Servicio / Taller" },
  { name: "Target", label: "Leads / Metas" },
  { name: "Megaphone", label: "Marketing" },
  { name: "Briefcase", label: "Ventas / Negocios" },
  { name: "Building", label: "Dirección / Corporativo" },
  { name: "Zap", label: "Kaizen / Innovación" },
  { name: "Calculator", label: "Contabilidad / Finanzas" },
  { name: "HeartHandshake", label: "Recursos Humanos / DO" },
  { name: "CarFront", label: "Autos / Comonuevos" },
  { name: "Phone", label: "Recepción / Atención" },
  { name: "Landmark", label: "Financiamiento / Legal" },
];

const RenderIcon = ({ iconName, className = "w-5 h-5" }) => {
  const IconComponent = iconName && LucideIcons[iconName] ? LucideIcons[iconName] : LucideIcons["Folder"];
  return <IconComponent className={className} />;
};

export default function PlacePanel({ users, onUsersChange, places }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [icon, setIcon] = useState("Folder");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isArea, setIsArea] = useState(false);
  
  // NUEVO: Estados para el modo edición
  const [editingId, setEditingId] = useState(null);

  // NUEVO: Función para cargar los datos en el formulario al hacer clic en Editar
  const handleEditClick = (place) => {
    setEditingId(place.id);
    setName(place.name);
    setIcon(place.icon || "Folder");
    
    if (place.parentId) {
      setIsArea(true);
      setRole(place.parentId);
    } else {
      setIsArea(false);
      setRole("");
    }
    
    // Hacemos scroll suave hacia arriba para que vea el formulario
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // NUEVO: Función para cancelar la edición
  const handleCancelEdit = () => {
    setEditingId(null);
    setName("");
    setRole("");
    setIcon("Folder");
    setIsArea(false);
  };

  // ACTUALIZADO: Maneja tanto Crear como Actualizar
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        name,
        parentId: role || null,
        icon: icon,
      };

      let result;
      if (editingId) {
        result = await updatePlace(editingId, payload); // Modo Actualizar
      } else {
        result = await createPlace(payload); // Modo Crear
      }
      
      if (result.success) {
        sileo.success({
          title: editingId ? "Departamento Actualizado" : "Departamento Creado",
          description: `${name} se guardó correctamente`,
          fill: "#D8F3DC",
          styles: { title: "text-black/75!", description: "text-black/75!", badge: "bg-white!" },
        });
        handleCancelEdit(); // Limpiamos el formulario
        onUsersChange(); // Recargamos la lista
      } else {
        sileo.error({
          title: "Error",
          description: result.error,
          fill: "#EB0A1E",
          icon: <CircleAlert className="size-4.5" />,
          styles: { title: "text-white!", description: "text-white!", badge: "bg-white!" },
        });
      }
    } catch (error) {
      alert("Error al procesar la solicitud");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* FORMULARIO */}
        <div className="lg:col-span-1 bg-white rounded-3xl p-6 shadow-sm border border-gray-100 h-fit sticky top-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Network className="w-5 h-5 text-brand" /> 
              {editingId ? "Editar Departamento" : "Nuevo Departamento"}
            </h3>
            {editingId && (
              <button onClick={handleCancelEdit} className="text-gray-400 hover:text-red-500 transition-colors" title="Cancelar edición">
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              placeholder="Ej. Sistemas"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm"
            />

            {/* Selector de Ícono */}
            <div className="flex flex-col gap-2 ml-2">
              <span className="text-sm font-medium text-gray-700">Ícono representativo</span>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
                  <RenderIcon iconName={icon} className="w-4 h-4" />
                </div>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl pl-10 p-3 text-sm font-semibold cursor-pointer appearance-none"
                >
                  {AVAILABLE_ICONS.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-2 items-center ml-2 mt-2">
              <span className="text-sm font-medium text-gray-700">¿Es una sub-área?</span>
              <label className="flex flex-row items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isArea}
                  onChange={(e) => setIsArea(e.target.checked)}
                  className="peer hidden"
                />
                <div className="h-5 w-5 flex rounded-md border border-[#a2a1a833] bg-[#e8e8e8] peer-checked:bg-brand transition">
                  <Check className="size-4.5 text-white m-auto" />
                </div>
              </label>
            </div>

            {isArea && (
              <div className="flex flex-col gap-2 ml-2">
                <span className="text-sm font-medium text-gray-700">Departamento Padre</span>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold cursor-pointer"
                >
                  <option value="">Selecciona un departamento</option>
                  {places.map((depto) => (
                    <option key={depto.id} value={depto.id}>{depto.name}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-brand text-white text-sm font-bold rounded-xl hover:bg-brand-hover cursor-pointer transition-colors flex items-center justify-center gap-2 mt-4"
            >
              {isSubmitting
                ? "Guardando..."
                : editingId 
                  ? "Actualizar Cambios" 
                  : isArea ? "Crear Sub-área" : "Crear Departamento"}
            </button>
          </form>
        </div>

        {/* LISTA DE DEPARTAMENTOS */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Departamentos Registrados</h3>
          <div className="space-y-3">
            {places.map((place) => (
              <div key={place.id} className={`flex items-center gap-4 bg-gray-50 rounded-xl p-3 border transition-colors ${editingId === place.id ? 'border-brand bg-brand/5' : 'border-transparent'}`}>
                
                <div className="w-10 h-10 bg-white rounded-lg shadow-sm flex items-center justify-center text-brand">
                  <RenderIcon iconName={place.icon} />
                </div>
                
                <div className="flex flex-col flex-1">
                  <span className="text-sm font-semibold text-gray-900">{place.name}</span>
                  {place.children && place.children.length > 0 && (
                    <span className="text-xs text-gray-500">
                      {place.children.map((hijo) => hijo.name).join(", ")}
                    </span>
                  )}
                </div>

                {/* BOTÓN DE EDITAR */}
                <button 
                  onClick={() => handleEditClick(place)}
                  className="p-2 text-gray-400 hover:text-brand hover:bg-white rounded-lg transition-all cursor-pointer"
                  title="Editar departamento"
                >
                  <Pencil className="w-4 h-4" />
                </button>

              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}