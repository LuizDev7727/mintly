import { db } from "@/infra/db/client.ts";
import { inspirationalThumbnailsTable } from "@/infra/db/tables/inspirational-thumbnail.table.ts";
import { and, desc, eq, lt } from "drizzle-orm";
import { getChannel } from "../channel/get-channel.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";

type GetInspirationalThumbnailsParams = {
  channelId: string;
  cursor?: string;
};

const PAGE_SIZE = 10;

export async function getInspirationalThumbnails(params: GetInspirationalThumbnailsParams) {
  const { channelId, cursor } = params;

  await getChannel({
    channelId
  })

  const result = await db.select({
    id: inspirationalThumbnailsTable.id,
    name: inspirationalThumbnailsTable.name,
    key: inspirationalThumbnailsTable.key,
    sizeInMs: inspirationalThumbnailsTable.sizeInMs,
  })
    .from(inspirationalThumbnailsTable)
    .where(
      and(
        eq(inspirationalThumbnailsTable.channelId, channelId),
        cursor ? lt(inspirationalThumbnailsTable.id, cursor) : undefined,
      )
    )
    .orderBy(desc(inspirationalThumbnailsTable.id))
    .limit(PAGE_SIZE + 1);

  const hasMore = result.length > PAGE_SIZE;
  const page = hasMore ? result.slice(0, PAGE_SIZE) : result;
  const nextCursor = hasMore ? page[page.length - 1].id : null;

  const inspirationalThumbnails = await Promise.all(page.map(async ({ key, ...rest }) => {
    return {
      ...rest,
      url: await generateSignedUrl({ key })
    }
  }))

  return {
    inspirationalThumbnails,
    nextCursor,
  }
}
