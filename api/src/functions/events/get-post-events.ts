import { db } from "@/infra/db/client.ts"
import { postEventsTable } from "@/infra/db/tables/post-events.table.ts"
import { postsTable } from "@/infra/db/tables/posts.table.ts"
import { and, asc, eq } from "drizzle-orm"

type GetPostEventsParams = {
  channelId: string
  postId: string
}

type GetPostEventsResponse = {
  postEvents: {
    id: string
    status: typeof postEventsTable.$inferSelect["status"]
    createdAt: Date
  }[]
}

export async function getPostEvents(
  params: GetPostEventsParams,
): Promise<GetPostEventsResponse> {
  const { channelId, postId } = params

  const postEvents = await db
    .select({
      id: postEventsTable.id,
      status: postEventsTable.status,
      createdAt: postEventsTable.createdAt,
    })
    .from(postEventsTable)
    .innerJoin(postsTable, eq(postsTable.id, postEventsTable.postId))
    .where(
      and(
        eq(postEventsTable.postId, postId),
        eq(postsTable.channelId, channelId),
      ),
    )
    .orderBy(asc(postEventsTable.createdAt), asc(postEventsTable.id))

  return { postEvents }
}
