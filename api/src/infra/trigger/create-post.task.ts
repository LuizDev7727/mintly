import { logger, schemaTask, tasks, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { convertVideoToMp3Task } from "./convert-video-to-mp3.task.ts";
import { transcribeAudioTask } from "./transcribe-audio.task.ts";
import { seoEnrichmentTask } from "./seo-enrichment.task.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { generateThubmnailTask } from "./generate-thumbnail.task.ts";
import { db } from "@/infra/db/client.ts";
import { uploadPostToYoutubeTask } from "./upload-post-to-youtube.task.ts";

export const createPostTask = schemaTask({
  id: "process-post",
  schema: z.object({
    post: z.object({
      fileUrl: z.url(),
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
            provider: z.enum(["YOUTUBE", "TIKTOK"]),
          }),
        )
        .min(1, { error: "Post needs at least one integration selected" }),
    }),
    postId: z.uuidv7(),
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
    await db
      .update(postsTable)
      .set({
        status: "PUBLISHED",
      })
      .where(eq(postsTable.id, postId));
  },

  onFailure: async ({ payload }) => {
    const { postId } = payload;
    await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, postId));
  },

  onCancel: async ({ payload }) => {
    const { postId } = payload;
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
    const scheduledPostTo = payload.post.scheduledTo;

    if (scheduledPostTo) {
      logger.log("Waiting for scheduled post to: ", { scheduledPostTo });
      await wait.until({
        date: new Date(scheduledPostTo),
      });
    }

    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run

    const { post, postId } = payload;

    const {
      shouldGenerateShorts,
      shouldGenerateThumbnail,
      socialsToPost,
      fileUrl,
    } = post;

    logger.log("Video Url: ", { fileUrl });
    logger.log("Sould generate thumbnail: ", { shouldGenerateThumbnail });
    logger.log("Sould generate shorts: ", { shouldGenerateShorts });

    const convertVideoToMp3TaskResponse = await tasks.triggerAndWait<
      typeof convertVideoToMp3Task
    >("convert-video-to-mp3", {
      videoUrl: fileUrl,
      basePathToSaveOnR2: "posthub/posts",
      type: "post",
      postId,
    });

    const { ok: hasConvertVideoTop3TaskCompleted } =
      convertVideoToMp3TaskResponse;

    if (!hasConvertVideoTop3TaskCompleted) {
      return;
    }

    const { audioUrl } = convertVideoToMp3TaskResponse.output;

    const transcribeAudioTaskResponse = await tasks.triggerAndWait<
      typeof transcribeAudioTask
    >("transcribe-audio", {
      audioUrl,
      postId,
    });

    const { ok: hasTranscribeAudioTaskCompleted } = transcribeAudioTaskResponse;

    if (!hasTranscribeAudioTaskCompleted) {
      return;
    }

    const { transcription } = transcribeAudioTaskResponse.output;

    logger.log("Transcription: ", { transcription });

    const seoEnrichmentResponse = await tasks.triggerAndWait<
      typeof seoEnrichmentTask
    >("seo-enrichment", {
      postId,
      transcription,
    });

    if (!seoEnrichmentResponse.ok) {
      return;
    }

    const {
      title: newPostTitle,
      description: postDescription,
      tags,
    } = seoEnrichmentResponse.output;

    if (shouldGenerateThumbnail) {
      await tasks.trigger<typeof generateThubmnailTask>("generate-thumbnail", {
        postId,
        videoUrl: fileUrl,
        postDescription,
      });
    }

    for (const social of socialsToPost) {
      switch(social.provider) {
        case "YOUTUBE":
          await tasks.trigger<typeof uploadPostToYoutubeTask>(
            "upload-post-to-youtube",
            {
              title: newPostTitle,
              description: postDescription,
              tags,
              videoUrl: fileUrl,
              postId,
            },
          );
          break;
      }
    }
  },
});
