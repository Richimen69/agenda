import React, { useState } from "react";
// Agregamos el icono Ban (o puede ser Trash) para identificar la acción
import { X, PlusCircle, Bot, User, Ban } from "lucide-react";

const formatDateTime = (value) =>
  new Date(value).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const LeadTimelineModal = ({ lead, isOpen, onClose, onAddComment, user, onMarkAsTrash }) => {
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen || !lead) return null;

  const sortedComments = [...(lead.comments || [])].sort(
    (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
  );

  const handleAdd = async () => {
    if (!note.trim()) return;
    setSaving(true);
    const ok = await onAddComment(lead.id, note.trim(), user.name);
    if (ok) setNote("");
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{lead.fullName}</h3>
            <p className="text-xs text-gray-400">{lead.phone} · Bitácora de seguimiento</p>
          </div>
          
          {/* NUEVO CONTENEDOR DE ACCIONES EN LA CABECERA */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (window.confirm("¿Estás seguro de marcar este lead como basura?")) {
                  onMarkAsTrash(lead.id);
                  onClose(); // Opcional: cerrar el modal después de marcarlo
                }
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
              title="Descartar lead"
            >
              <Ban className="w-3.5 h-3.5" />
              Marcar como basura
            </button>

            <button onClick={onClose} className="p-1">
              <X className="w-5 h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </button>
          </div>
        </div>

        {/* TIMELINE */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {sortedComments.length === 0 && (
            <p className="text-sm text-gray-400 text-center py-8">Sin actividad registrada aún.</p>
          )}
          {sortedComments.map((comment) => {
            const isSystem = comment.author === "Sistema";
            return (
              <div key={comment.id} className="flex gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                    isSystem ? "bg-gray-100" : "bg-blue-50"
                  }`}
                >
                  {isSystem ? (
                    <Bot className="w-3.5 h-3.5 text-gray-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 border-b border-gray-50 pb-3">
                  <p className="text-sm text-gray-700">{comment.text}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    {formatDateTime(comment.createdAt)} · {comment.author}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* AGREGAR NOTA */}
        <div className="pt-4 border-t border-gray-100 mt-3 flex gap-2">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            placeholder="Agregar nota de seguimiento..."
            className="flex-1 border border-gray-200 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-brand"
          />
          <button
            onClick={handleAdd}
            disabled={saving || !note.trim()}
            className="flex items-center gap-1 px-3 py-2 bg-brand text-white rounded-md text-sm disabled:opacity-50 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};