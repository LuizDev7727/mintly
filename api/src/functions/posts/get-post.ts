import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { db } from "@/infra/db/client.ts";
import { foldersTable } from "@/infra/db/tables/folders.table.ts";
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
  mimeType: string;
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
  folder: {
    id: string;
    title: string;
  } | null;
  author: {
    name: string;
    avatarUrl: string | null;
  };
  socialsToPost: {
    social: "YOUTUBE" | "TIKTOK" | "INSTAGRAM";
    socialName: string;
  }[];
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
      mimeType: postsTable.mimeType,
      createdAt: postsTable.createdAt,
      size: postsTable.size,
      duration: postsTable.duration,
      status: postsTable.status,
      folderId: foldersTable.id,
      folderTitle: foldersTable.title,
      author: {
        name: usersTable.name,
        avatarUrl: usersTable.image,
      },
      socialsToPost: sql<
        { social: "YOUTUBE" | "TIKTOK" | "INSTAGRAM"; socialName: string }[]
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
    .leftJoin(foldersTable, eq(postsTable.folderId, foldersTable.id))
    .innerJoin(
      socialsToPostTable,
      eq(postsTable.id, socialsToPostTable.postId),
    )
    .where(eq(postsTable.id, postId))
    .groupBy(
      postsTable.id,
      usersTable.name,
      usersTable.image,
      foldersTable.id,
      foldersTable.title,
    )
    .limit(1);

  if (!post) {
    throw new ResourceNotFoundError("Post not found");
  }

  const { thumbnailStorageKey, folderId, folderTitle, ...rest } = post;

  return {
    ...rest,
    folder:
      folderId !== null && folderTitle !== null
        ? { id: folderId, title: folderTitle }
        : null,
    thumbnailUrl: thumbnailStorageKey
      ? await generateSignedUrl({ key: thumbnailStorageKey })
      : null,
  };
}
