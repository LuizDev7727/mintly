import type { Project } from "@/types/project";
import { useParams } from "@tanstack/react-router";
import { ProjectGridCard } from "./project-grid-card";

type ProjectsGridViewProps = {
  projects: Project[];
};

export function ProjectsGridView({ projects }: ProjectsGridViewProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectGridCard
          key={project.id}
          project={project}
          slug={slug}
          channel={channel}
        />
      ))}
    </div>
  );
}
