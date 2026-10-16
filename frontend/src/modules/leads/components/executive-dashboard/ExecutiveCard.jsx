import React from 'react';

export const ExecutiveCard = ({ title, value, icon: Icon, colorClass, subtitle }) => {
  return (
    <div className={`relative overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-transform hover:scale-105 ${colorClass}`}>
      {/* Círculo decorativo de fondo */}
      <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white opacity-10"></div>
      
      <div className="relative z-10 flex flex-col h-full justify-between">
        
        {/* Fila 1: Título e Ícono */}
        <div className="flex justify-between items-start mb-2">
          <p className="text-sm font-medium text-white/80 uppercase tracking-wider pr-4">
            {title}
          </p>
          {/* El ícono ahora vive arriba a la derecha, con un fondo sutil */}
          <div className="opacity-90 bg-white/10 p-2 rounded-xl shrink-0">
            {Icon && <Icon size={24} strokeWidth={2} />}
          </div>
        </div>
        
        {/* Fila 2: La Cantidad (ahora tiene todo el ancho de la tarjeta para expandirse) */}
        <div>
          {/* tracking-tight junta un poco los números para que quepan mejor las cifras millonarias */}
          <h3 className="text-2xl sm:text-3xl font-bold tracking-tight break-words">
            {value}
          </h3>
          
          {/* Subtítulo */}
          {subtitle && (
            <p className="text-xs mt-2 bg-white/20 inline-block px-2 py-1 rounded-full">
              {subtitle}
            </p>
          )}
        </div>

      </div>
    </div>
  );
};