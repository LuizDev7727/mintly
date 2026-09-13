import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { and, count, eq } from "drizzle-orm";

type GetStarredFoldersParams = {
  channelId: string;
};

type StarredFolder = {
  id: string;
  title: string;
  postsCount: number;
};

type GetStarredFoldersResponse = {
  folders: StarredFolder[];
};

export async function getStarredFolders(
  params: GetStarredFoldersParams,
): Promise<GetStarredFoldersResponse> {
  const { channelId } = params;

  const folders = await db
    .select({
      id: foldersTable.id,
      title: foldersTable.title,
      postsCount: count(postsTable.id),
    })
    .from(foldersTable)
    .leftJoin(postsTable, eq(postsTable.folderId, foldersTable.id))
    .where(
      and(
        eq(foldersTable.isStarred, true),
        eq(foldersTable.channelId, channelId),
      ),
    )
    .groupBy(foldersTable.id);

  return { folders };
}
