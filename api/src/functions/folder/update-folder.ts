import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { eq } from "drizzle-orm";
import { ResourceNotFoundError } from "../errors/resource-not-found.error.ts";

type UpdateFolderParams = {
  folderId: string;
  title: string;
};

export async function updateFolder(params: UpdateFolderParams): Promise<void> {
  const { folderId, title } = params;

  const [updated] = await db
    .update(foldersTable)
    .set({ title })
    .where(eq(foldersTable.id, folderId))
    .returning({ id: foldersTable.id });

  if (!updated) {
    throw new ResourceNotFoundError("Folder not found");
  }
}
