import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { generateRealtimeToken } from "@/utils/generate-realtime-token.ts";
import { and, count, desc, eq, isNull, like, sql } from "drizzle-orm";

type GetPostsParams = {
  titleFilter: string | null;
  pageIndex: number;
  channelId: string;
  folderId: string | null;
};

const ACTIVE_POST_STATUSES = [
  "PROCESSING",
  "ENCODING",
  "TRANSCRIBING",
  "SEO_GENERATING",
  "GENERATING_METADATA",
  "GENERATING_THUMBNAIL",
  "PUBLISHING",
] as const;

type GetPostsResponse = {
  posts: {
    id: string;
    thumbnailUrl: string | null;
    title: string;
    size: number;
    status: string;
    runId: string;
    realtimeToken: string | null;
  }[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
}

export async function getPosts(params: GetPostsParams): Promise<GetPostsResponse> {
  const { titleFilter, pageIndex, channelId, folderId } = params;

  const PAGE_SIZE = 10;

  const [getPostsQueryResult, [{ totalPostsCount }]] = await Promise.all([
    db
      .select({
        id: postsTable.id,
        thumbnailStorageKey: postsTable.thumbnailStorageKey,
        title: postsTable.title,
        size: postsTable.size,
        status: postsTable.status,
        runId: postsTable.runId,
        mimeType: postsTable.mimeType,
        duration: postsTable.duration,
        createdAt: postsTable.createdAt,
        publishAt: postsTable.scheduledTo,
        socialsToPost: sql<
          { id: string; social: "YOUTUBE" | "TIKTOK" | "INSTAGRAM"; socialName: string; avatarUrl: string | null }[]
        >`
                    json_agg(
                      json_build_object(
                        'id', ${socialsToPostTable.id},
                        'social', ${socialsToPostTable.social},
                        'socialName', ${socialsToPostTable.socialName},
                        'avatarUrl', ${socialsToPostTable.avatarUrl}
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


  // The code below generates the realtime token only for active post statuses.
  // To not generate token where posts has already been published or error or scheduled.
  // (ACTIVE_POST_STATUSES as readonly string[]).includes(post.status)

  const posts = await Promise.all(
    getPostsQueryResult.map(async ({ thumbnailStorageKey, ...post }) => {
      // runId is only ever null in the brief window between inserting the
      // post row and the trigger.dev task's onStart callback running — by
      // the time a post is listed here, it's always populated.
      const runId = post.runId!;

      return {
        ...post,
        runId,
        thumbnailUrl: thumbnailStorageKey
          ? await generateSignedUrl({ key: thumbnailStorageKey })
          : null,
        realtimeToken: (ACTIVE_POST_STATUSES as readonly string[]).includes(
          post.status,
        )
          ? await generateRealtimeToken({ runId })
          : null,
      };
    }),
  );

  return {
    posts,
    meta: {
      totalCount: totalPostsCount,
      totalPages,
    },
  };
}
