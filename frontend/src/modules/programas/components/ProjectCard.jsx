import { Calendar, Users } from "lucide-react";
export default function ProjectCard({ project }) {
  const progress = Math.min(100, Math.max(0, project.globalProgress ?? 0));

  return (
    <div className="bg-white rounded-xl p-3 flex flex-col gap-2 shadow-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-green-500 rounded-full" />
          <p className="text-xs">{project.health}</p>
        </div>
        <div className="bg-gray-100 px-2 py-1 rounded-xl">
          <p className="text-xs">{project.status}</p>
        </div>
      </div>
      <p className="font-bold">{project.title}</p>
      <p className="text-sm">{project.description}</p>
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <p className="text-xs">Progreso Global</p>
          <p className="text-xs">{progress}%</p>
        </div>
        <div className="bg-gray-200 h-2 rounded-full overflow-hidden">
          <div
            className="bg-brand h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
      <div className="text-xs flex items-center gap-5">
        <div className="flex gap-1">
          <Calendar size={15} />
          <p>
            {new Date(project.targetDate).toLocaleDateString("es-MX", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        </div>
        <div className="flex gap-1">
          <Users size={15} />
          <p>{project.members.length} {project.members.length > 1 ? 'Miembros' : 'Miembro'} </p>
        </div>
      </div>
    </div>
  );
}
