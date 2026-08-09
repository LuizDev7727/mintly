import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { count, eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type GetProjectParams = {
  projectId: string;
};

type GetProjectResponse = {
  title: string;
  bestMomentsCount: number;
  owner: {
    name: string;
  };
};

export async function getProject(
  params: GetProjectParams,
): Promise<GetProjectResponse> {
  const { projectId } = params;

  const [project] = await db
    .select({
      title: projectsTable.title,
      bestMomentsCount: count(bestMomentsTable.id),
      owner: {
        name: usersTable.name,
      },
    })
    .from(projectsTable)
    .leftJoin(
      bestMomentsTable,
      eq(bestMomentsTable.projectId, projectsTable.id),
    )
    .innerJoin(usersTable, eq(projectsTable.ownerId, usersTable.id))
    .where(eq(projectsTable.id, projectId))
    .groupBy(projectsTable.id, usersTable.name);

  if (!project) {
    throw new ResourceNotFoundError("Project not found");
  }

  return project;
}
