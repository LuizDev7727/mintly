import { faker } from "@faker-js/faker";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import type { Replace } from "./replace.ts";
import { db } from "@/infra/db/client.ts";

type ProjectProps = typeof projectsTable.$inferInsert;

type Overrides = Partial<Replace<ProjectProps, {}>>;

export async function makeFakeProject(
  channelId: string,
  ownerId: string,
  data = {} as Overrides,
) {
  const title = data.title ?? faker.lorem.words({ min: 3, max: 8 });

  const [{ projectId }] = await db
    .insert(projectsTable)
    .values({
      title,
      channelId,
      ownerId,
      status: data.status,
      thumbnailUrl: data.thumbnailUrl,
    })
    .returning({ projectId: projectsTable.id });

  return { projectId };
}
