import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { and, count, eq, isNull } from "drizzle-orm";
import { ResourceNotFoundError } from "../errors/resource-not-found.error.ts";

const PAGE_SIZE = 12;

type GetFoldersParams = {
  channelId: string;
  folderName: string | null;
  pageIndex: number;
};

type Folder = {
  id: string;
  title: string;
  postsCount: number;
};

type GetFoldersResponse = {
  folders: Folder[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
  parent: {
    id: string;
    title: string;
  } | null;
};

export async function getFolders(
  params: GetFoldersParams,
): Promise<GetFoldersResponse> {
  const { channelId, folderName, pageIndex } = params;

  let parentFolder: { id: string; title: string } | null = null;
  let currentFolderId: string | null = null;

  if (folderName !== null) {
    const [currentFolder] = await db
      .select({
        id: foldersTable.id,
        title: foldersTable.title,
        parentId: foldersTable.parentId,
      })
      .from(foldersTable)
      .where(and(eq(foldersTable.title, folderName), eq(foldersTable.channelId, channelId)))
      .limit(1);

    if (!currentFolder) {
      throw new ResourceNotFoundError(
        `Folder with name: ${folderName} not found`,
      );
    }

    currentFolderId = currentFolder.id;

    if (currentFolder.parentId !== null) {
      const [result] = await db
        .select({
          id: foldersTable.id,
          title: foldersTable.title,
        })
        .from(foldersTable)
        .where(eq(foldersTable.id, currentFolder.parentId))
        .limit(1);

      parentFolder = result ?? null;
    }
  }

  const parentFilter = currentFolderId
    ? eq(foldersTable.parentId, currentFolderId)
    : isNull(foldersTable.parentId);

  const [folders, [{ totalCount }]] = await Promise.all([
    db
      .select({
        id: foldersTable.id,
        title: foldersTable.title,
        postsCount: count(postsTable.id),
      })
      .from(foldersTable)
      .leftJoin(postsTable, eq(postsTable.folderId, foldersTable.id))
      .where(and(eq(foldersTable.channelId, channelId), parentFilter))
      .groupBy(foldersTable.id)
      .limit(PAGE_SIZE)
      .offset(pageIndex * PAGE_SIZE),

    db
      .select({ totalCount: count() })
      .from(foldersTable)
      .where(and(eq(foldersTable.channelId, channelId), parentFilter)),
  ]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return {
    folders,
    meta: {
      totalCount,
      totalPages,
    },
    parent: parentFolder,
  };
}
