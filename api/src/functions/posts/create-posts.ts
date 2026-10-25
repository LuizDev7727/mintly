import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { createPostTask } from "@/infra/trigger/create-post.task.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
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
      provider: "YOUTUBE" | "TIKTOK" | "INSTAGRAM";
      avatarUrl: string | null;
    }[]
  }[];
  ownerId: string
  channelId: string
};

export async function createPosts(params:CreatePostsParams) {
  const { posts, ownerId, channelId } = params;
  for (const post of posts) {

    const { file, shouldGenerateThumbnail, shouldGenerateShorts, scheduledTo, socialsToPost } = post;

    await checkFileExists({ key: file.key });

    const scheduledToDate = scheduledTo ? new Date(scheduledTo) : null;

    const duration = Math.round(file.duration ?? 0);

    const [{ postInsertedId }] = await db.insert(postsTable).values({
      channelId,
      description: "",
      duration,
      title: file.name,
      mimeType: file.type,
      status: scheduledToDate ? "SCHEDULED" : "PROCESSING",
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
        avatarUrl: social.avatarUrl,
      });
    }

    await tasks.trigger<typeof createPostTask>("process-post", {
      post: {
        title: file.name,
        mimeType: file.type,
        scheduledTo,
        shouldGenerateShorts,
        shouldGenerateThumbnail,
        socialsToPost: socialsToPost,
        // O link assinado é gerado pela própria task, depois da espera do
        // agendamento: um link criado agora não pode valer por mais de 7 dias.
        fileKey: file.key,
        size: file.size,
        duration,
      },
      postId: postInsertedId,
      channelId,
    });
  }
}
