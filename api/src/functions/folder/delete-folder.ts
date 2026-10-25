import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { and, eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type DeleteFolderParams = {
  channelId: string;
  folderId: string;
};

export async function deleteFolder(params: DeleteFolderParams): Promise<void> {
  const { channelId, folderId } = params;

  const [deleted] = await db
    .delete(foldersTable)
    .where(and(eq(foldersTable.id, folderId), eq(foldersTable.channelId, channelId)))
    .returning({ id: foldersTable.id });

  if (!deleted) {
    throw new ResourceNotFoundError("Folder not found");
  }
}
