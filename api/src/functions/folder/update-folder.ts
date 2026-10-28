import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { and, eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type UpdateFolderParams = {
  channelId: string;
  folderId: string;
  title: string;
};

export async function updateFolder(params: UpdateFolderParams): Promise<void> {
  const { channelId, folderId, title } = params;

  const [updated] = await db
    .update(foldersTable)
    .set({ title })
    .where(and(eq(foldersTable.id, folderId), eq(foldersTable.channelId, channelId)))
    .returning({ id: foldersTable.id });

  if (!updated) {
    throw new ResourceNotFoundError("Folder not found");
  }
}
