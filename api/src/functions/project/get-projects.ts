import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { and, count, desc, eq, like } from "drizzle-orm";
import { getChannel } from "../channel/get-channel.ts";

type GetProjectsParams = {
  channelId: string;
  pageIndex: number;
  titleFilter: string | null;
};

type GetProjectsResponse = {
  projects: {
    id: string;
    title: string;
    thumbnailUrl: string | null;
    status: "SUCCESS" | "PROCESSING" | "SCHEDULED" | "ERROR" | "CANCELED";
    createdAt: Date;
    clipCount: number;
    owner: {
      name: string;
      avatarUrl: string | null;
    };
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

const PAGE_SIZE = 12;

export async function getProjects(
  params: GetProjectsParams,
): Promise<GetProjectsResponse> {
  const { channelId, pageIndex, titleFilter } = params;

  await getChannel({ channelId });

  const filters = and(
    eq(projectsTable.channelId, channelId),
    titleFilter ? like(projectsTable.title, `%${titleFilter}%`) : undefined,
  );

  const [projects, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: projectsTable.id,
        title: projectsTable.title,
        thumbnailUrl: projectsTable.thumbnailUrl,
        status: projectsTable.status,
        createdAt: projectsTable.createdAt,
        clipCount: count(bestMomentsTable.id),
        owner: {
          name: usersTable.name,
          avatarUrl: usersTable.image,
        },
      })
      .from(projectsTable)
      .where(filters)
      .leftJoin(
        bestMomentsTable,
        eq(bestMomentsTable.projectId, projectsTable.id),
      )
      .innerJoin(usersTable, eq(projectsTable.ownerId, usersTable.id))
      .groupBy(projectsTable.id, usersTable.name, usersTable.image)
      .orderBy(desc(projectsTable.createdAt))
      .offset(pageIndex * PAGE_SIZE)
      .limit(PAGE_SIZE),

    db
      .select({ totalCount: count(projectsTable.id) })
      .from(projectsTable)
      .where(filters),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    projects,
    meta: {
      totalCount,
      totalPages,
    },
  };
}
