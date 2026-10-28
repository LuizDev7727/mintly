import { AbortTaskRunError, schemaTask, tasks } from "@trigger.dev/sdk";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { uploadPostToYoutubeTask } from "./upload-post-to-youtube.task.ts";

// Publica um melhor momento (clipe já pronto) no YouTube e acompanha o status
// do post. O status fica aqui, e não em `upload-post-to-youtube`, porque essa
// task também roda como etapa filha de `process-post`, que é quem decide o
// status quando há várias redes.
export const publishBestMomentTask = schemaTask({
  id: "publish-best-moment",
  schema: z.object({
    videoUrl: z.url(),
    title: z.string(),
    postId: z.uuidv7(),
    integrationId: z.string(),
    channelId: z.string(),
  }),

  onStart: async ({ payload, ctx }) => {
    await db
      .update(postsTable)
      .set({ status: "PUBLISHING", runId: ctx.run.id })
      .where(eq(postsTable.id, payload.postId));
  },

  onSuccess: async ({ payload }) => {
    await db
      .update(postsTable)
      .set({ status: "PUBLISHED" })
      .where(eq(postsTable.id, payload.postId));
  },

  onFailure: async ({ payload }) => {
    await db
      .update(postsTable)
      .set({ status: "ERROR" })
      .where(eq(postsTable.id, payload.postId));
  },

  onCancel: async ({ payload }) => {
    await db
      .update(postsTable)
      .set({ status: "CANCELED" })
      .where(eq(postsTable.id, payload.postId));
  },

  maxDuration: 600,
  run: async (payload) => {
    const upload = await tasks.triggerAndWait<typeof uploadPostToYoutubeTask>(
      "upload-post-to-youtube",
      {
        videoUrl: payload.videoUrl,
        title: payload.title,
        description: "",
        tags: [],
        postId: payload.postId,
        integrationId: payload.integrationId,
        channelId: payload.channelId,
      },
    );

    // `AbortTaskRunError` não faz retry: um retry publicaria o vídeo de novo.
    if (!upload.ok) {
      throw new AbortTaskRunError(`Step "upload-post-to-youtube" failed`);
    }
  },
});
