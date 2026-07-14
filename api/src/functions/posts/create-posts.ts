import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { createPostTask } from "@/infra/trigger/create-post.task.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import { tasks } from "@trigger.dev/sdk";

type CreatePostsParams = {
  posts: {
    file: {
      name: string
      key: string
      duration: number | null
      size: number
      type: string
    },
    shouldGenerateThumbnail: boolean
    shouldGenerateShorts: boolean
    scheduledTo: string | null,
    socialsToPost: {
      id: string;
      name: string;
      provider: "YOUTUBE" | "TIKTOK";
    }[]
  }[];
  ownerId: string
  channelId: string
};

const SIGNED_URL_SCHEDULE_BUFFER_IN_SECONDS = 60 * 60 * 2; // 2 hours

export async function createPosts(params:CreatePostsParams) {
  const { posts, ownerId, channelId } = params;
  for (const post of posts) {

    const { file, shouldGenerateThumbnail, shouldGenerateShorts, scheduledTo, socialsToPost } = post;

    await checkFileExists({ key: file.key });

    const scheduledToDate = scheduledTo ? new Date(scheduledTo) : null;

    const [{ postInsertedId }] = await db.insert(postsTable).values({
      channelId,
      description: "",
      duration: Math.round(file.duration ?? 0),
      title: file.name,
      mimeType: file.type,
      size: file.size,
      scheduledTo: scheduledToDate,
      ownerId,
    }).returning({ postInsertedId: postsTable.id })

    for(let i = 0; i < socialsToPost.length; i++) {
      const social = socialsToPost[i];
      await db.insert(socialsToPostTable).values({
        postId: postInsertedId,
        social: social.provider,
        socialName: social.name,
      });
    }

    const expiresIn = scheduledToDate
      ? Math.floor((scheduledToDate.getTime() - Date.now()) / 1000) +
        SIGNED_URL_SCHEDULE_BUFFER_IN_SECONDS
      : undefined;

    const fileUrl = await generateSignedUrl({ key: file.key, expiresIn })

    await tasks.trigger<typeof createPostTask>("process-post", {
      post: {
        scheduledTo,
        shouldGenerateShorts,
        shouldGenerateThumbnail,
        socialsToPost: socialsToPost,
        fileUrl,
      },
      postId: postInsertedId,
    });
  }
}
