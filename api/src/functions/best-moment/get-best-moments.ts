import { db } from "@/infra/db/client.ts";
import { bestMomentsTable } from "@/infra/db/tables/best-moments.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { and, desc, eq, lt } from "drizzle-orm";

type GetBestMomentsParams = {
  projectId: string;
  cursor?: string;
};

type GetBestMomentsResponse = {
  bestMoments: {
    id: string;
    title: string;
    url: string;
    createdAt: Date;
  }[];
  nextCursor: string | null;
};

const PAGE_SIZE = 10;

export async function getBestMoments(
  params: GetBestMomentsParams,
): Promise<GetBestMomentsResponse> {
  const { projectId, cursor } = params;

  const result = await db
    .select({
      id: bestMomentsTable.id,
      title: bestMomentsTable.title,
      storageKey: bestMomentsTable.storageKey,
      createdAt: bestMomentsTable.createdAt,
    })
    .from(bestMomentsTable)
    .where(
      and(
        eq(bestMomentsTable.projectId, projectId),
        cursor ? lt(bestMomentsTable.id, cursor) : undefined,
      ),
    )
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
