import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
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
    .update(foldersTable)
    .set({ isStarred: false })
    .where(
      and(
        eq(foldersTable.id, folderId),
        eq(foldersTable.channelId, channelId),
      ),
    );
}
