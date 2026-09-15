import { useViewMode } from "@/context/view-mode-context";
import { getProjectsHttp } from "@/http/projects/get-projects.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  parseAsInteger,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import { ProjectsEmpty } from "./projects-empty";
import { ProjectsGridView } from "./projects-grid-view";
import { ProjectsListView } from "./projects-list-view";
import { ProjectsLoading } from "./projects-loading";
import { ProjectsPagination } from "./projects-pagination";

const PROJECT_STATUSES = [
  "SUCCESS",
  "PROCESSING",
  "ENCODING",
  "ERROR",
  "CANCELED",
] as const;

export function Projects() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [currentPage] = useQueryState(
    "project_page",
    parseAsInteger.withDefault(0),
  );

  const [titleFilter] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  const [statusFilter] = useQueryState(
    "status_filter",
    parseAsStringLiteral(PROJECT_STATUSES),
  );

  const [ownerFilter] = useQueryState("owner_filter");

  const { view } = useViewMode();

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "projects",
      slug,
      channel,
      titleFilter,
      statusFilter,
      ownerFilter,
      currentPage,
    ],
    queryFn: async () =>
      getProjectsHttp({
        orgSlug: slug,
        channelId: channel,
        pageIndex: currentPage,
        titleFilter,
        statusFilter,
        ownerId: ownerFilter ?? null,
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

  const { projects, meta } = data;
  const { totalPages, totalCount } = meta;
  const isProjectsEmpty = projects.length === 0;

  if (isProjectsEmpty) {
    return <ProjectsEmpty />;
  }

  return (
    <div className="space-y-4">
      {view === "grid" && <ProjectsGridView projects={projects} />}
      {view === "list" && <ProjectsListView projects={projects} />}

      <ProjectsPagination totalPages={totalPages} totalCount={totalCount} />
    </div>
  )
}
