import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { and, eq, isNull } from "drizzle-orm";
import { FolderAlreadyExistsError } from "../errors/folder-already-exists.error.ts";

type CreateFolderParams = {
  title: string;
  channelId: string;
  parentId: string | null;
};

type CreateFolderResponse = {
  folderId: string;
};

export async function createFolder(
  params: CreateFolderParams,
): Promise<CreateFolderResponse> {
  const { title, channelId, parentId } = params;

  const [duplicate] = await db
    .select()
    .from(foldersTable)
    .where(
      and(
        eq(foldersTable.title, title),
        eq(foldersTable.channelId, channelId),
        parentId
          ? eq(foldersTable.parentId, parentId)
          : isNull(foldersTable.parentId),
      ),
    )
    .limit(1);

  if (duplicate) {
    throw new FolderAlreadyExistsError();
  }

  const [{ folderId }] = await db
    .insert(foldersTable)
    .values({ title, channelId, parentId })
    .returning({ folderId: foldersTable.id });

  return { folderId };
}
