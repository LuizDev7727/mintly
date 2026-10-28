import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { and, eq } from "drizzle-orm";
import { runs } from "@trigger.dev/sdk";

type CancelPostParams = {
  postId: string;
  channelId: string;
};

export async function cancelPost({ postId, channelId }: CancelPostParams) {
  const [post] = await db
    .select({ id: postsTable.id, runId: postsTable.runId })
    .from(postsTable)
    .where(and(eq(postsTable.id, postId), eq(postsTable.channelId, channelId)))
    .limit(1);

  if (!post) {
    throw new ResourceNotFoundError("Post not found");
  }

  // O runId vem do próprio post. Aceitá-lo do cliente permitiria cancelar
  // qualquer run do projeto no Trigger.dev, de qualquer organização.
  if (post.runId) {
    await runs.cancel(post.runId);
  }

  await db
    .update(postsTable)
    .set({ status: "CANCELED" })
    .where(and(eq(postsTable.id, postId), eq(postsTable.channelId, channelId)));
}
