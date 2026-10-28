import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
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

  // A pasta também precisa ser do canal da URL: só o id dela faria os posts
  // serem ligados a uma pasta de outra organização.
  if (folderId) {
    const [folder] = await db
      .select({ id: foldersTable.id })
      .from(foldersTable)
      .where(
        and(
          eq(foldersTable.id, folderId),
          eq(foldersTable.channelId, channelId),
        ),
      );

    if (!folder) {
      throw new ResourceNotFoundError("Folder not found");
    }
  }

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
