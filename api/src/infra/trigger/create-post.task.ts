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
import { generateSignedUrl } from "@/utils/cloudflare/generate-signed-url.ts";
import {
  publishPostFailedWebhook,
  publishPostPostedWebhook,
} from "@/webhooks/publish-post-webhooks.ts";
import { eq } from "drizzle-orm";
import { generateThubmnailTask } from "./generate-thumbnail.task.ts";
import { convertImageToJpegTask } from "./convert-image-to-jpeg.task.ts";
import {
  getCaptionFromFileName,
  isImageMimeType,
  needsJpegConversion,
} from "@/utils/media-type.ts";
import { db } from "@/infra/db/client.ts";
import { uploadPostToYoutubeTask } from "./upload-post-to-youtube.task.ts";
import { uploadPostToTiktokTask } from "./upload-post-to-tiktok.task.ts";
import { uploadPostToInstagramTask } from "./upload-post-to-instagram.task.ts";

// Validade do link do arquivo, gerado depois da espera do agendamento. Precisa
// cobrir a pipeline inteira (conversão, transcrição, SEO e uploads).
const FILE_URL_EXPIRES_IN_SECONDS = 60 * 60 * 2; // 2 hours

// Falha a run inteira quando uma etapa filha falha. `AbortTaskRunError` não
// dispara retry da task pai: um retry reexecutaria as etapas anteriores e
// poderia publicar o mesmo vídeo de novo em redes que já deram certo.
function failStep(step: string): never {
  throw new AbortTaskRunError(`Step "${step}" failed`);
}

type PreparedPost = {
  title: string;
  description: string;
  tags: string[];
  // Arquivo que as redes recebem (pode ser diferente do enviado pelo usuário).
  publishUrl: string;
};

// Vídeo: converte o áudio, transcreve, gera título/descrição/tags e, se pedido,
// a thumbnail.
async function prepareVideo(params: {
  fileUrl: string;
  postId: string;
  duration: number;
  shouldGenerateThumbnail: boolean;
}): Promise<PreparedPost> {
  const { fileUrl, postId, duration, shouldGenerateThumbnail } = params;

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

  return {
    title: newPostTitle,
    description: postDescription,
    tags,
    publishUrl: fileUrl,
  };
}

// Imagem: não há áudio para converter nem transcrever, então não há SEO. A
// legenda é o nome do arquivo. O Instagram só aceita JPEG, então PNG e WebP são
// convertidos antes.
async function prepareImage(params: {
  fileUrl: string;
  postId: string;
  mimeType: string;
  title: string;
}): Promise<PreparedPost> {
  const { fileUrl, postId, mimeType, title } = params;

  let publishUrl = fileUrl;

  if (needsJpegConversion(mimeType)) {
    metadata.set("status", "ENCODING");
    await db
      .update(postsTable)
      .set({ status: "ENCODING" })
      .where(eq(postsTable.id, postId));

    const conversion = await tasks.triggerAndWait<typeof convertImageToJpegTask>(
      "convert-image-to-jpeg",
      { imageUrl: fileUrl, postId },
    );

    if (!conversion.ok) {
      failStep("convert-image-to-jpeg");
    }

    publishUrl = conversion.output.jpegUrl;
  }

  return {
    title: getCaptionFromFileName(title),
    description: "",
    tags: [],
    publishUrl,
  };
}

// O que a `run` devolve e o `onSuccess` usa no webhook `post.posted`. Os hooks
// recebem o `output` sem tipo, então ele é validado aqui.
const postOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export const createPostTask = schemaTask({
  id: "process-post",
  schema: z.object({
    post: z.object({
      title: z.string(),
      mimeType: z.string(),
      fileKey: z.string(),
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

  onSuccess: async ({ payload, output }) => {
    const { postId, channelId } = payload;
    metadata.set("status", "PUBLISHED");
    await db
      .update(postsTable)
      .set({
        status: "PUBLISHED",
      })
      .where(eq(postsTable.id, postId));

    // Um webhook que falha não pode mudar o resultado do post: só é registrado.
    const published = postOutputSchema.safeParse(output);

    if (published.success) {
      await publishPostPostedWebhook({ channelId, ...published.data }).catch(
        (error) =>
          logger.error("Failed to publish the post.posted webhook", { error }),
      );
    }
  },

  onFailure: async ({ payload, error }) => {
    const { postId, channelId } = payload;
    metadata.set("status", "ERROR");
    await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, postId));

    const reason = error instanceof Error ? error.message : String(error);

    await publishPostFailedWebhook({
      channelId,
      message: `Failed to process the post: ${reason}`,
    }).catch((webhookError) =>
      logger.error("Failed to publish the post.failed webhook", { webhookError }),
    );
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
      title,
      mimeType,
      shouldGenerateShorts,
      shouldGenerateThumbnail,
      socialsToPost,
      fileKey,
      size,
      duration,
    } = post;

    const fileUrl = await generateSignedUrl({
      key: fileKey,
      expiresIn: FILE_URL_EXPIRES_IN_SECONDS,
    });

    logger.log("Video Url: ", { fileUrl });
    logger.log("Sould generate thumbnail: ", { shouldGenerateThumbnail });
    logger.log("Sould generate shorts: ", { shouldGenerateShorts });

    const isImage = isImageMimeType(mimeType);

    if (isImage && socialsToPost.some((social) => social.provider !== "INSTAGRAM")) {
      // A API já recusa essa combinação; aqui é só a última barreira.
      failStep("images can only be published on Instagram");
    }

    const prepared = isImage
      ? await prepareImage({ fileUrl, postId, mimeType, title })
      : await prepareVideo({ fileUrl, postId, duration, shouldGenerateThumbnail });

    const { title: publishTitle, description, tags, publishUrl } = prepared;

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
              title: publishTitle,
              description,
              tags,
              videoUrl: publishUrl,
              postId,
              integrationId: social.id,
              channelId,
            },
          };

        case "INSTAGRAM":
          return {
            id: "upload-post-to-instagram" as const,
            payload: {
              title: publishTitle,
              fileUrl: publishUrl,
              fileSizeInBytes: size,
              postId,
              integrationId: social.id,
              channelId,
              mediaType: isImage ? ("IMAGE" as const) : ("VIDEO" as const),
            },
          };

        case "TIKTOK":
          return {
            id: "upload-post-to-tiktok" as const,
            payload: {
              title: publishTitle,
              fileSizeInBytes: size,
              fileUrl: publishUrl,
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

    // O `onSuccess` usa isto no webhook `post.posted`.
    return { title: publishTitle, description, tags };
  },
});
