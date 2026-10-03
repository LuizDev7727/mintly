import { db } from "@/infra/db/client.ts";
import { sql } from "drizzle-orm";

type GetFoldersTreeParams = {
  channelId: string;
};

type FolderTreeNode = {
  id: string;
  title: string;
  parentId: string | null;
  depth: number;
  postsCount: number;
  isStarred: boolean;
  hasChildren: boolean;
};

type GetFoldersTreeResponse = {
  folders: FolderTreeNode[];
};

/**
 * Returns every folder of the channel as a flat list in depth-first order
 * (each folder is followed by its descendants, siblings sorted by title).
 * The `depth` and `parentId` fields let the client rebuild the tree without
 * extra requests.
 */
export async function getFoldersTree(
  params: GetFoldersTreeParams,
): Promise<GetFoldersTreeResponse> {
  const { channelId } = params;

  const { rows } = await db.execute<FolderTreeNode>(sql`
    WITH RECURSIVE folder_tree AS (
      SELECT
        f.id,
        f.title,
        f.parent_id,
        f.is_starred,
        0 AS depth,
        ARRAY[lower(f.title::text), f.id] AS sort_path
      FROM folders f
      WHERE f.channel_id = ${channelId} AND f.parent_id IS NULL

      UNION ALL

      SELECT
        child.id,
        child.title,
        child.parent_id,
        child.is_starred,
        parent.depth + 1,
        parent.sort_path || ARRAY[lower(child.title::text), child.id]
      FROM folders child
      INNER JOIN folder_tree parent ON child.parent_id = parent.id
      WHERE child.channel_id = ${channelId}
    )
    SELECT
      tree.id,
      tree.title,
      tree.parent_id AS "parentId",
      tree.depth::int AS depth,
      tree.is_starred AS "isStarred",
      (
        SELECT count(*)::int FROM posts p WHERE p.folder_id = tree.id
      ) AS "postsCount",
      EXISTS (
        SELECT 1 FROM folders child WHERE child.parent_id = tree.id
      ) AS "hasChildren"
    FROM folder_tree tree
    ORDER BY tree.sort_path
  `);

  return { folders: rows };
}
