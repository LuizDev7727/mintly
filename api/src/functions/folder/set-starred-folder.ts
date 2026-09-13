import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { and, eq } from "drizzle-orm";

type SetStarredFolderParams = {
  folderId: string;
  channelId: string;
};

type SetStarredFolderResponse = {
  starredFolderId: string;
};

export async function setStarredFolder(
  params: SetStarredFolderParams,
): Promise<SetStarredFolderResponse> {
  const { folderId, channelId } = params;

  const [folder] = await db
    .update(foldersTable)
    .set({ isStarred: true })
    .where(
      and(
        eq(foldersTable.id, folderId),
        eq(foldersTable.channelId, channelId),
      ),
    )
    .returning({ id: foldersTable.id });

  if (!folder) {
    throw new ResourceNotFoundError(`Folder with id ${folderId} not found`);
  }

  return { starredFolderId: folder.id };
}
