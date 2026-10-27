import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { socialsToPostTable } from "@/infra/db/tables/socials-to-post.table.ts";
import { createPostTask } from "@/infra/trigger/create-post.task.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { tasks } from "@trigger.dev/sdk";
import { eq } from "drizzle-orm";

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

  // Confere todos os arquivos antes de gravar qualquer coisa: se um deles não
  // existe, o lote falha sem ter criado nenhum post.
  await Promise.all(posts.map(({ file }) => checkFileExists({ key: file.key })));

  for (const post of posts) {

    const { file, shouldGenerateThumbnail, shouldGenerateShorts, scheduledTo, socialsToPost } = post;

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

    await db.insert(socialsToPostTable).values(
      socialsToPost.map((social) => ({
        postId: postInsertedId,
        social: social.provider,
        socialName: social.name,
        avatarUrl: social.avatarUrl,
      })),
    );

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
    }).catch(async (error) => {
      // Sem run, nada vai processar este post: ele aparece como falho em vez de
      // ficar para sempre em PROCESSING ou SCHEDULED.
      await db
        .update(postsTable)
        .set({ status: "ERROR" })
        .where(eq(postsTable.id, postInsertedId));

      throw error;
    });
  }
}
