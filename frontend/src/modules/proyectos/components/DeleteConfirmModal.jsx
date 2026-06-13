import { Trash2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, ticketTitle }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-900/55 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-3xl border border-gray-100 w-full max-w-sm overflow-hidden">

        <div className="p-6 pb-0">
          <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <Trash2 className="w-5 h-5 text-red-700" />
          </div>
          <p className="text-base font-bold text-gray-900 mb-1">Eliminar proyecto</p>
          <p className="text-sm text-gray-500 leading-relaxed mb-5">
            ¿Estás seguro de que deseas eliminar{' '}
            <span className="font-medium text-gray-800">"{ticketTitle}"</span>?
            Esta acción no se puede deshacer y se perderán todos los comentarios y bitácora asociados.
          </p>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-red-800 text-red-50 text-sm font-bold hover:bg-red-900 transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>

      </div>
    </div>
  );
}