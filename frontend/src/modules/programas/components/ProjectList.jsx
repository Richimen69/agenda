import { Link } from "react-router-dom"; // <-- 1. Importas Link
import ProjectCard from "./ProjectCard";

export default function ProjectList({ myProjects }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {myProjects?.length > 0 &&
        myProjects.map((project) => (
          // 2. Envuelves el ProjectCard con el Link
          // Nota: El key siempre va en el elemento padre del map
          <Link 
            key={project.id} 
            to={`/proyectos/${project.id}`} // <-- La ruta a tu DetailPage
            className="block transition-transform hover:-translate-y-1" // Opcional: un efectito hover
          >
            <ProjectCard project={project} />
          </Link>
        ))}
    </div>
  );
}