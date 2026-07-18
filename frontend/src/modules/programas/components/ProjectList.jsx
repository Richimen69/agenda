import ProjectCard from "./ProjectCard";

export default function ProjectList({ myProjects }) {
    console.log(myProjects)
  return (
    <div className="grid grid-cols-3 gap-5">
      {myProjects?.length > 0 &&
        myProjects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
    </div>
  );
}
