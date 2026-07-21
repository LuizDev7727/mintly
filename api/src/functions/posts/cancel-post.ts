import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { runs } from "@trigger.dev/sdk";

type CancelPostParams = {
  postId: string;
  runId: string;
};

export async function cancelPost({ postId, runId }: CancelPostParams) {
  const [post] = await db
    .select({ id: postsTable.id })
    .from(postsTable)
    .where(eq(postsTable.id, postId))
    .limit(1);

  if (!post) {
    throw new ResourceNotFoundError("Post not found");
  }

  await runs.cancel(runId);

  await db
    .update(postsTable)
    .set({ status: "CANCELED" })
    .where(eq(postsTable.id, postId));
}
