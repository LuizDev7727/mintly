import { useViewMode } from "@/context/view-mode-context";
import { getProjectsHttp } from "@/http/projects/get-projects.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsString, useQueryState } from "nuqs";
import { ProjectsEmpty } from "./projects-empty";
import { ProjectsGridView } from "./projects-grid-view";
import { ProjectsListView } from "./projects-list-view";
import { ProjectsLoading } from "./projects-loading";

export function Projects() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [titleFilter] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  const { view } = useViewMode();

  const { data, isLoading, error } = useQuery({
    queryKey: ["projects", slug, channel, titleFilter],
    queryFn: async () =>
      getProjectsHttp({
        orgSlug: slug,
        channelId: channel,
        titleFilter,
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading) {
    return <ProjectsLoading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    return null;
  }

  const { projects } = data;
  const isProjectsEmpty = projects.length === 0;

  if (isProjectsEmpty) {
    return <ProjectsEmpty />;
  }

  return (
    <>
      {view === "grid" && <ProjectsGridView projects={projects} />}
      {view === "list" && <ProjectsListView projects={projects} />}
    </>
  )

}
