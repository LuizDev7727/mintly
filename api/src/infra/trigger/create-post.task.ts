import {
  AbortTaskRunError,
  batch,
  logger,
  metadata,
  schemaTask,
  tasks,
  wait,
} from "@trigger.dev/sdk";
import { z } from "zod";
import { convertVideoToMp3Task } from "./convert-video-to-mp3.task.ts";
import { transcribeAudioTask } from "./transcribe-audio.task.ts";
import { seoEnrichmentTask } from "./seo-enrichment.task.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { generateThubmnailTask } from "./generate-thumbnail.task.ts";
import { db } from "@/infra/db/client.ts";
import { uploadPostToYoutubeTask } from "./upload-post-to-youtube.task.ts";
import { uploadPostToTiktokTask } from "./upload-post-to-tiktok.task.ts";
import { uploadPostToInstagramTask } from "./upload-post-to-instagram.task.ts";

// Falha a run inteira quando uma etapa filha falha. `AbortTaskRunError` não
// dispara retry da task pai: um retry reexecutaria as etapas anteriores e
// poderia publicar o mesmo vídeo de novo em redes que já deram certo.
function failStep(step: string): never {
  throw new AbortTaskRunError(`Step "${step}" failed`);
}

export const createPostTask = schemaTask({
  id: "process-post",
  schema: z.object({
    post: z.object({
      fileUrl: z.url(),
      size: z.number(),
      duration: z.number(),
      shouldGenerateThumbnail: z.boolean(),
      shouldGenerateShorts: z.boolean(),
      scheduledTo: z
        .string()
        .nullable()
        .refine(
          (dateSelected) => {
            if (!dateSelected) return true;
            return new Date(dateSelected) > new Date();
          },
          { error: "The date cannot be in the past" },
        ),
      socialsToPost: z
        .array(
          z.object({
            id: z.string(),
            name: z.string(),
            provider: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
          }),
        )
        .min(1, { error: "Post needs at least one integration selected" }),
    }),
    postId: z.uuidv7(),
    channelId: z.string(),
  }),
  onStart: async ({ payload, ctx }) => {
    const { postId } = payload;
    await db
      .update(postsTable)
      .set({
        runId: ctx.run.id,
      })
      .where(eq(postsTable.id, postId));
  },

  onSuccess: async ({ payload }) => {
    const { postId } = payload;
    metadata.set("status", "PUBLISHED");
    await db
      .update(postsTable)
      .set({
        status: "PUBLISHED",
      })
      .where(eq(postsTable.id, postId));
  },

  onFailure: async ({ payload }) => {
    const { postId } = payload;
    metadata.set("status", "ERROR");
    await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, postId));
  },

  onCancel: async ({ payload }) => {
    const { postId } = payload;
    metadata.set("status", "CANCELED");
    await db
      .update(postsTable)
      .set({
        status: "CANCELED",
      })
      .where(eq(postsTable.id, postId));
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    metadata.set("status", "PROCESSING");

    const scheduledPostTo = payload.post.scheduledTo;

    if (scheduledPostTo) {
      logger.log("Waiting for scheduled post to: ", { scheduledPostTo });
      metadata.set("status", "SCHEDULED");
      await wait.until({
        date: new Date(scheduledPostTo),
      });
      metadata.set("status", "PROCESSING");
    }

    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run

    const { post, postId, channelId } = payload;

    const {
      shouldGenerateShorts,
      shouldGenerateThumbnail,
      socialsToPost,
      fileUrl,
      size,
      duration,
    } = post;

    logger.log("Video Url: ", { fileUrl });
    logger.log("Sould generate thumbnail: ", { shouldGenerateThumbnail });
    logger.log("Sould generate shorts: ", { shouldGenerateShorts });

    metadata.set("status", "ENCODING");

    const convertVideoToMp3TaskResponse = await tasks.triggerAndWait<
      typeof convertVideoToMp3Task
    >("convert-video-to-mp3", {
      videoUrl: fileUrl,
      basePathToSaveOnR2: "posthub/posts",
      type: "post",
      postId,
      duration,
    });

    if (!convertVideoToMp3TaskResponse.ok) {
      failStep("convert-video-to-mp3");
    }

    const { audioUrl } = convertVideoToMp3TaskResponse.output;

    metadata.set("status", "TRANSCRIBING");

    const transcribeAudioTaskResponse = await tasks.triggerAndWait<
      typeof transcribeAudioTask
    >("transcribe-audio", {
      audioUrl,
      postId,
      type: "post",
    });

    if (!transcribeAudioTaskResponse.ok) {
      failStep("transcribe-audio");
    }

    const { transcription } = transcribeAudioTaskResponse.output;

    logger.log("Transcription: ", { transcription });

    metadata.set("status", "SEO_GENERATING");

    const seoEnrichmentResponse = await tasks.triggerAndWait<
      typeof seoEnrichmentTask
    >("seo-enrichment", {
      postId,
      transcription,
    });

    if (!seoEnrichmentResponse.ok) {
      failStep("seo-enrichment");
    }

    const {
      title: newPostTitle,
      description: postDescription,
      tags,
    } = seoEnrichmentResponse.output;

    if (shouldGenerateThumbnail) {
      metadata.set("status", "GENERATING_THUMBNAIL");
      await tasks.trigger<typeof generateThubmnailTask>("generate-thumbnail", {
        postId,
        videoUrl: fileUrl,
        postDescription,
      });
    }

    metadata.set("status", "PUBLISHING");
    await db
      .update(postsTable)
      .set({ status: "PUBLISHING" })
      .where(eq(postsTable.id, postId));

    // Os uploads rodam em paralelo e a run só termina quando todos acabam: o
    // `onSuccess` (PUBLISHED) só dispara se todas as redes deram certo, e
    // qualquer falha cai no `onFailure` (ERROR).
    const uploads = socialsToPost.map((social) => {
      switch (social.provider) {
        case "YOUTUBE":
          return {
            id: "upload-post-to-youtube" as const,
            payload: {
              title: newPostTitle,
              description: postDescription,
              tags,
              videoUrl: fileUrl,
              postId,
            },
          };

        case "INSTAGRAM":
          return {
            id: "upload-post-to-instagram" as const,
            payload: {
              title: newPostTitle,
              fileUrl,
              fileSizeInBytes: size,
              postId,
            },
          };

        case "TIKTOK":
          return {
            id: "upload-post-to-tiktok" as const,
            payload: {
              title: newPostTitle,
              fileSizeInBytes: size,
              fileUrl,
              postId,
              channelId,
            },
          };
      }
    });

    const uploadsResult = await batch.triggerAndWait<
      | typeof uploadPostToYoutubeTask
      | typeof uploadPostToInstagramTask
      | typeof uploadPostToTiktokTask
    >(uploads);

    const failedUploads = uploadsResult.runs
      .filter((run) => !run.ok)
      .map((run) => run.taskIdentifier);

    if (failedUploads.length > 0) {
      failStep(failedUploads.join(", "));
    }
  },
});
