import { useState, useEffect } from "react";
import { X, Plus, Trash2, Check } from "lucide-react";
import { sileo } from "sileo";
import { getUsersById, updateUser } from "../services/users.api";

export default function EditUserModal({
  isOpen,
  onClose,
  userId,
  onSubmit,
  onUsersChange,
  places,
}) {
  const [subtasks, setSubtasks] = useState([]);
  const [userData, setUserData] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        const result = await getUsersById(userId);
        if (isMounted) {
          setUserData(result);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };
    if (userId) {
      fetchUserData();
    }
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const { area, ...restOfData } = userData;
      const dataToSend = {
        ...restOfData,
        areaId: area?.id || null,
      };
      const result = await updateUser(userId, dataToSend);
      if (result.success) {
        sileo.success({
          title: "Usuario Actualizado",
          description: name + " " + "Actualizado correctamente",
          fill: "#D8F3DC",
          styles: {
            title: "text-black/75!",
            description: "text-black/75!",
            badge: "bg-white!",
          },
        });
        onUsersChange();
        onClose();
      }
    } catch (error) {
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
    } finally {
      setIsSubmitting(false);
    }
  };
  if (!isOpen) return null;

  return (
    // Overlay oscuro y blur
    <div className="fixed inset-0 bg-content-main/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      {/* Contenedor del Modal: Restringimos la altura para que scrollee internamente si es muy largo */}
      <div className="bg-layout-surface rounded-xl shadow-2xl w-full max-w-90 flex flex-col max-h-[90vh] overflow-hidden border border-layout-border">
        {/* Header Fijo */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-layout-border bg-layout-surface">
          <h2 className="text-lg font-semibold text-content-main tracking-tight">
            Editar Usuario
          </h2>
          <button
            onClick={onClose}
            className="text-content-muted cursor-pointer hover:text-content-main hover:bg-layout-hover p-1.5 rounded-md transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body (Formulario scrolleable) */}
        <form
          id="edit-user-form"
          onSubmit={handleSubmit}
          className="p-6 overflow-y-auto space-y-5 custom-scrollbar"
        >
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Nombre <span className="text-status-danger">*</span>
            </label>
            <input
              type="text"
              value={userData.name || ""}
              onChange={(e) =>
                setUserData({ ...userData, name: e.target.value })
              }
              required
              placeholder="Ej: Rediseño de la intranet corporativa"
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              Email <span className="text-status-danger">*</span>
            </label>
            <input
              type="email"
              value={userData.email || ""}
              onChange={(e) =>
                setUserData({ ...userData, email: e.target.value })
              }
              required
              placeholder="Ej: usuario@toyotaguerro.com.mx"
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-content-main mb-1.5">
              WhatsApp <span className="text-status-danger">*</span>
            </label>
            <input
              type="phone"
              value={userData.whatsappPhone || ""}
              onChange={(e) =>
                setUserData({ ...userData, whatsappPhone: e.target.value })
              }
              required
              placeholder="Ej: usuario@toyotaguerro.com.mx"
              className="w-full bg-layout-surface border border-layout-border rounded-md px-3 py-2 text-sm text-content-main placeholder:text-content-muted focus:outline-none focus:ring-1 focus:ring-brand focus:border-brand transition-shadow"
            />
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium text-gray-700">
              Departamento
            </span>
            <select
              value={userData.area?.id || ""}
              onChange={(e) =>
                setUserData({ ...userData, area: { id: e.target.value } })
              }
              className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-semibold cursor-pointer"
            >
              <option value="">Selecciona un puesto</option>
              {places.map((depto) => (
                <optgroup key={depto.id} label={depto.name}>
                  {depto.children.length > 0 ? (
                    depto.children.map((hijo) => (
                      <option key={hijo.id} value={hijo.id}>
                        {hijo.name}
                      </option>
                    ))
                  ) : (
                    <option value={depto.id}>{depto.name}</option>
                  )}
                </optgroup>
              ))}
            </select>
          </div>
        </form>

        {/* Footer Fijo con Acciones (Primary / Secondary) */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 border-t border-layout-border bg-layout-app/50">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-semibold text-content-main bg-layout-surface border border-layout-border rounded-md hover:bg-layout-hover transition-colors disabled:opacity-50 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            form="edit-user-form"
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-semibold text-white bg-brand rounded-md hover:bg-brand-hover focus:ring-2 focus:ring-offset-2 focus:ring-brand transition-all disabled:opacity-60 cursor-pointer flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Guardando...
              </>
            ) : (
              "Guardar Cambios"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
