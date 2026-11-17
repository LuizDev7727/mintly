import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { projectsTable } from "@/infra/db/tables/projects.table.ts";
import { tagsTable } from "@/infra/db/tables/tags.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, desc, eq, lt, sql } from "drizzle-orm";

type GetBestMomentsParams = {
  projectId: string;
  channelId: string;
  cursor?: string;
};

type GetBestMomentsResponse = {
  bestMoments: {
    id: string;
    title: string;
    description: string | null;
    tags: string[];
    url: string;
    createdAt: Date;
  }[];
  nextCursor: string | null;
};

const PAGE_SIZE = 10;

export async function getBestMoments(
  params: GetBestMomentsParams,
): Promise<GetBestMomentsResponse> {
  const { projectId, channelId, cursor } = params;

  const [project] = await db
    .select({ id: projectsTable.id })
    .from(projectsTable)
    .where(
      and(eq(projectsTable.id, projectId), eq(projectsTable.channelId, channelId)),
    );

  if (!project) {
    throw new ResourceNotFoundError("Project not found");
  }

  // leftJoin (não innerJoin): clipes sem tag, como os antigos, precisam continuar
  // aparecendo. O groupBy mantém uma linha por clipe, então o limit e o cursor
  // continuam contando clipes e não tags.
  const result = await db
    .select({
      id: bestMomentsTable.id,
      title: bestMomentsTable.title,
      description: bestMomentsTable.description,
      storageKey: bestMomentsTable.storageKey,
      createdAt: bestMomentsTable.createdAt,
      tags: sql<string[]>`
        coalesce(
          json_agg(${tagsTable.name} order by ${tagsTable.id})
            filter (where ${tagsTable.id} is not null),
          '[]'::json
        )
      `.as("tags"),
    })
    .from(bestMomentsTable)
    .leftJoin(
      tagsTable,
      eq(tagsTable.bestMomentId, bestMomentsTable.id)
    )
    .where(
      and(
        eq(bestMomentsTable.projectId, projectId),
        cursor ? lt(bestMomentsTable.id, cursor) : undefined,
      ),
    )
    .groupBy(bestMomentsTable.id)
    .orderBy(desc(bestMomentsTable.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = result.length > PAGE_SIZE;
  const page = hasMore ? result.slice(0, PAGE_SIZE) : result;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const bestMoments = await Promise.all(
    page.map(async ({ storageKey, ...rest }) => ({
      ...rest,
      url: await generateSignedUrl({ key: storageKey }),
    })),
  );

  return {
    bestMoments,
    nextCursor,
  };
}
