import React from 'react';

const CrearEventModal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" 
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md bg-white rounded-xl shadow-xl" 
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          className="absolute top-3 right-4 text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          onClick={onClose}
          aria-label="Cerrar"
        >
        </button>
        <div className="mt-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default CrearEventModal;