import { useState } from "react";
import { AlignLeft } from "lucide-react"; // Nuevo ícono para la descripción
import DeleteConfirmModal from "@modules/proyectos/components/DeleteConfirmModal";

import TicketHeader from "./TicketHeader";
import TicketPeopleCards from "./TicketPeopleCards";
import TicketChecklist from "./TicketChecklist";
import TicketBitacora from "./TicketBitacora";
import TicketProperties from "./TicketProperties";

export default function TicketDetail({
  ticket,
  users,
  activeUserId,
  onBack,
  onStatusChange,
  onAddComment,
  onDelete,
  onUpdate,
}) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const isCreator = ticket.creatorId === activeUserId;

  return (
    // Max-w-6xl le da un poco más de aire (Enterprise) frente a 5xl
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* 1. Cabecera */}
      <TicketHeader
        ticket={ticket}
        isCreator={isCreator}
        onBack={onBack}
        onStatusChange={onStatusChange}
        onDeleteRequest={() => setIsDeleteModalOpen(true)}
      />
      {/* 2. Tarjetas de Equipo */}
      <TicketPeopleCards
        ticket={ticket}
        users={users}
        activeUserId={activeUserId}
        isCreator={isCreator}
        onUpdate={onUpdate}
      />

      {/* Bloque de Descripción (Anatomía Unificada) */}
      <div className="bg-layout-surface rounded-xl border border-layout-border shadow-sm flex flex-col overflow-hidden">
        {/* Cabecera de Tarjeta */}
        <div className="px-5 py-4 border-b border-layout-border bg-layout-app/50 flex items-center gap-3">
          <div className="p-1.5 bg-white border border-layout-border rounded-md text-content-muted shadow-sm">
            <AlignLeft className="w-4 h-4" />
          </div>
          <h3 className="text-[15px] font-semibold text-content-main tracking-tight">
            Detalles adicionales
          </h3>
        </div>

        {/* Contenido (Respetando saltos de línea) */}
        <div className="p-5">
          {ticket.description ? (
            <p className="text-sm text-content-main leading-relaxed whitespace-pre-wrap break-words">
              {ticket.description}
            </p>
          ) : (
            <div className="border border-dashed border-layout-border rounded-lg p-5 text-center bg-layout-app/50">
              <p className="text-sm font-medium text-content-muted">
                No se proporcionó una descripción detallada para este proyecto.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* 3. Grid Asimétrico (70% - 30%) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* COLUMNA IZQUIERDA (Trabajo Activo) */}
        <div className="lg:col-span-2 space-y-6">
          <TicketChecklist
            ticket={ticket}
            users={users}
            activeUserId={activeUserId}
            isCreator={isCreator}
            onUpdate={onUpdate}
          />

          <TicketBitacora
            ticket={ticket}
            activeUserId={activeUserId}
            onAddComment={onAddComment}
          />
        </div>

        {/* COLUMNA DERECHA (Contexto / Meta-datos) */}
        {/* Magia UX: lg:sticky y top-6 hacen que esta columna siga al usuario al hacer scroll */}
        <div className="space-y-6 lg:sticky lg:top-6 self-start">
          <TicketProperties ticket={ticket} />

          {/* Opcional: Espacio para futuras expansiones (Ej. Archivos Adjuntos, Etiquetas) */}
        </div>
      </div>

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => {
          setIsDeleteModalOpen(false);
          onDelete(ticket.id);
        }}
        ticketTitle={ticket.title}
      />
    </div>
  );
}
