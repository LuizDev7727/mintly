import { db } from "@/infra/db/client.ts";
import { postEventsTable } from "@/infra/db/tables/post-events.table.ts";

type CreatePostEventParams = {
  postId: string,
  status: typeof postEventsTable.$inferSelect["status"];
}

export async function createPostEvent(params: CreatePostEventParams) {
  const { postId, status } = params

  await db
    .insert(postEventsTable)
    .values({
    postId,
    status
  })

}
