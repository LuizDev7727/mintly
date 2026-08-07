import { db } from "@/infra/db/client.ts";
import { starredFoldersTable } from "@/infra/db/tables/starred-folders.table.ts";
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

  const [existing] = await db
    .select({ id: starredFoldersTable.id })
    .from(starredFoldersTable)
    .where(
      and(
        eq(starredFoldersTable.folderId, folderId),
        eq(starredFoldersTable.channelId, channelId),
      ),
    )
    .limit(1);

  if (existing) {
    return { starredFolderId: existing.id };
  }

  const [{ starredFolderId }] = await db
    .insert(starredFoldersTable)
    .values({ folderId, channelId })
    .returning({ starredFolderId: starredFoldersTable.id });

  return { starredFolderId };
}
