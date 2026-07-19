import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { usersTable } from "@/infra/db/tables/users.table.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { eq, sql } from "drizzle-orm";

type GetPostParams = {
  postId: string;
};

type GetPostResponse = {
  title: string;
  thumbnailUrl: string | null;
  description: string;
  createdAt: Date;
  size: number;
  duration: number;
  status:
    | "PROCESSING"
    | "SCHEDULED"
    | "ERROR"
    | "PUBLISHED"
    | "ENCODING"
    | "GENERATING_METADATA"
    | "GENERATING_THUMBNAIL"
    | "TRANSCRIBING"
    | "SEO_GENERATING"
    | "PUBLISHING"
    | "CANCELED";
  author: {
    name: string;
    avatarUrl: string | null;
  };
  socialsToPost: { social: "YOUTUBE" | "TIKTOK"; socialName: string }[];
};

export async function getPost(
  params: GetPostParams,
): Promise<GetPostResponse> {
  const { postId } = params;

  const [post] = await db
    .select({
      title: postsTable.title,
      thumbnailStorageKey: postsTable.thumbnailStorageKey,
      description: postsTable.description,
      createdAt: postsTable.createdAt,
      size: postsTable.size,
      duration: postsTable.duration,
      status: postsTable.status,
      author: {
        name: usersTable.name,
        avatarUrl: usersTable.image,
      },
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
    })
    .from(postsTable)
    .innerJoin(usersTable, eq(postsTable.ownerId, usersTable.id))
    .innerJoin(
      socialsToPostTable,
      eq(postsTable.id, socialsToPostTable.postId),
    )
    .where(eq(postsTable.id, postId))
    .groupBy(postsTable.id, usersTable.name, usersTable.image)
    .limit(1);

  if (!post) {
    throw new ResourceNotFoundError("Post not found");
  }

  const { thumbnailStorageKey, ...rest } = post;

  return {
    ...rest,
    thumbnailUrl: thumbnailStorageKey
      ? await generateSignedUrl({ key: thumbnailStorageKey })
      : null,
  };
}
