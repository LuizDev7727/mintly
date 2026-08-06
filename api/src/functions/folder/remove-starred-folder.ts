import { db } from "@/infra/db/client.ts";
import { starredFoldersTable } from "@/infra/db/tables/starred-folders.table.ts";
import { and, eq } from "drizzle-orm";

type RemoveStarredFolderParams = {
  folderId: string;
  channelId: string;
};

export async function removeStarredFolder(
  params: RemoveStarredFolderParams,
): Promise<void> {
  const { folderId, channelId } = params;

  await db
    .delete(starredFoldersTable)
    .where(
      and(
        eq(starredFoldersTable.folderId, folderId),
        eq(starredFoldersTable.channelId, channelId),
      ),
    );
}
