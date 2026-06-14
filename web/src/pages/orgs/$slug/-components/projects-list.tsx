import { useSuspenseQuery } from "@tanstack/react-query";
import { ProjectCard } from "./project-card";
import { useParams } from "@tanstack/react-router";
import { getProjectsHttp } from "@/http/get-projects.http";
import { ProjectsListEmpty } from "./projects-list-empty";

export function ProjectsList() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["projects", slug],
    queryFn: () => getProjectsHttp({ orgSlug: slug }),
  });

  const { projects } = data;

  const isProjectsEmpty = projects.length === 0;

  if (isProjectsEmpty) {
    return <ProjectsListEmpty />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          slug={project.slug}
          title={project.name}
          avatarUrl={project.avatar}
          postsCount={project.postsCount}
          integrationsCount={project.integrationsCount}
        />
      ))}
    </div>
  );
}
