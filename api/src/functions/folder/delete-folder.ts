import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../../errors/resource-not-found.error.ts";

type DeleteFolderParams = {
  folderId: string;
};

export async function deleteFolder(params: DeleteFolderParams): Promise<void> {
  const { folderId } = params;

  const [deleted] = await db
    .delete(foldersTable)
    .where(eq(foldersTable.id, folderId))
    .returning({ id: foldersTable.id });

  if (!deleted) {
    throw new ResourceNotFoundError("Folder not found");
  }
}
