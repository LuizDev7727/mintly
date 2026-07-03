import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { and, count, desc, eq, isNull, like, sql } from "drizzle-orm";

type GetPostsParams = {
  titleFilter: string | null;
  pageIndex: number;
  channelId: string;
  folderId: string | null;
};

export async function getPosts(params: GetPostsParams) {
  const { titleFilter, pageIndex, channelId, folderId } = params;

  const PAGE_SIZE = 10;

  const [posts, [{ totalPostsCount }]] = await Promise.all([
    db
      .select({
        id: postsTable.id,
        thumbnailUrl: postsTable.thumbnailStorageKey,
        title: postsTable.title,
        size: postsTable.size,
        status: postsTable.status,
        runId: postsTable.runId,
        mimeType: postsTable.mimeType,
        scheduledTo: postsTable.scheduledTo,
        duration: postsTable.duration,
        createdAt: postsTable.createdAt,
        socialsToPost: sql<
          { social: "YOUTUBE" | "TIKTOK"; socialName: string }[]
        >`
                    json_agg(
                      json_build_object(
                        'social', ${socialsToPostTable.social},
                        'socialName', ${socialsToPostTable.socialName}
                      )
                    )
                  `.as("socialsToPost"),
        author: {
          name: usersTable.name,
        },
      })
      .from(postsTable)
      .where(
        and(
          folderId
            ? eq(postsTable.folderId, folderId)
            : isNull(postsTable.folderId),
          titleFilter ? like(postsTable.title, `%${titleFilter}%`) : undefined,
          eq(postsTable.channelId, channelId),
        ),
      )
      .innerJoin(
        socialsToPostTable,
        eq(postsTable.id, socialsToPostTable.postId),
      )
      .innerJoin(usersTable, eq(postsTable.ownerId, usersTable.id))
      .orderBy(desc(postsTable.createdAt))
      .offset(pageIndex * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .groupBy(postsTable.id, usersTable.name, usersTable.image),

    db
      .select({
        totalPostsCount: count(postsTable.id),
      })
      .from(postsTable)
      .where(
        and(
          folderId
            ? eq(postsTable.folderId, folderId)
            : isNull(postsTable.folderId),
          titleFilter ? like(postsTable.title, `%${titleFilter}%`) : undefined,
          eq(postsTable.channelId, channelId),
        ),
      ),
  ]);

  const totalPages = Math.ceil(totalPostsCount / PAGE_SIZE);
  return {
    posts,
    meta: {
      totalCount: totalPostsCount,
      totalPages,
    },
  };
}
