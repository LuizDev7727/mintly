import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { and, eq, inArray } from "drizzle-orm";

type MovePostsToFolderParams = {
  channelId: string;
  postIds: string[];
  folderId: string | null;
};

export async function movePostsToFolder(
  params: MovePostsToFolderParams,
): Promise<void> {
  const { channelId, postIds, folderId } = params;

  await db
    .update(postsTable)
    .set({ folderId })
    .where(
      and(
        eq(postsTable.channelId, channelId),
        inArray(postsTable.id, postIds),
      ),
    );
}
