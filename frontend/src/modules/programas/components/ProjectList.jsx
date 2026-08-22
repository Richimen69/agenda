import { Link } from "react-router-dom"; // <-- 1. Importas Link
import ProjectCard from "./ProjectCard";

export default function ProjectList({ myProjects }) {
  return (
    <div className="grid grid-cols-3 gap-5">
      {myProjects?.length > 0 &&
        myProjects.map((project) => (

          <Link 
            key={project.id} 
            to={`/proyectos/${project.id}` } 
            className="block transition-transform hover:-translate-y-1" 
          >
            <ProjectCard project={project} />
          </Link>
        ))}
    </div>
  );
}