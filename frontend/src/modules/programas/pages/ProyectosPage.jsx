import { useState } from "react";
import {
  Plus,
  CheckSquare,
  User,
  UserCheck,
  CheckCircle2,
  Filter,
} from "lucide-react";
import CreateProjectModal from "../components/CreateProjectModal";
import { createProject } from "../services/proyectos.api";

export default function ProyectosPage({ users, authUser, events, places }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCreateProject = async ({
        title,
        description,
        assigneeIds,
        dueDate,
  }) => {
    const result = await createProject({
      title,
      description,
      creatorId: activeUserId,
      assigneeIds,
      dueDate,
      priority,
      subtasks,
    });
    return result;
  };
  return (
    <div className="space-y-12 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-content-main tracking-tight">
            Gestión de Proyectos
          </h1>
          <p className="text-sm text-content-muted mt-1">
            Crea, asigna y da seguimiento a los proyectos del equipo.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand hover:bg-brand-hover text-white px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Nuevo Proyecto
        </button>
      </div>
      <CreateProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        users={users}
        places={places}
      />
    </div>
  );
}
