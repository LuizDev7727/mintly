import { logger, metadata, schemaTask, tasks, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { projectsTable } from "../db/tables/projects.table.ts";
import { channelsTable } from "../db/tables/channels.table.ts";
import { transcribeAudioTask } from "./transcribe-audio.task.ts";
import { convertVideoToMp3Task } from "./convert-video-to-mp3.task.ts";
import { bestMomentsTable } from "../db/tables/best-moments.table.ts";
import { tagsTable } from "../db/tables/tags.table.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { setUsage } from "@/utils/set-usage.ts";

type ModalGenerateTextCallbackPayload = {
  status: "SUCCESS" | "ERROR";
  text?: string;
  error?: string;
  cost: {
    amount: number;
    currency: string;
  };
};

type ModalCallbackPayload = {
  output_key: string;
  size: number;
  status: string;
  cost: {
    amount: number;
    currency: string;
  };
};

export const createProjectTask = schemaTask({
  id: "create-project",
  schema: z.object({
    videoUrl: z.url(),
    projectId: z.uuidv7(),
  }),
  onStart: async ({ payload, ctx }) => {
    const { projectId } = payload;
    await db
      .update(projectsTable)
      .set({
        runId: ctx.run.id,
      })
      .where(eq(projectsTable.id, projectId));
  },

  onSuccess: async ({ payload }) => {
    const { projectId } = payload;
    metadata.set("status", "SUCCESS");
    await db
      .update(projectsTable)
      .set({
        status: "SUCCESS",
      })
      .where(eq(projectsTable.id, projectId));
  },

  onFailure: async ({ payload }) => {
    const { projectId } = payload;
    metadata.set("status", "ERROR");
    await db
      .update(projectsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(projectsTable.id, projectId));
  },

  onCancel: async ({ payload }) => {
    const { projectId } = payload;
    metadata.set("status", "CANCELED");
    await db
      .update(projectsTable)
      .set({
        status: "CANCELED",
      })
      .where(eq(projectsTable.id, projectId));
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    metadata.set("status", "ENCODING");

    const { projectId, videoUrl } = payload;

    logger.log("ProjectId created: ", { projectId });
    logger.log("VideoUrl: ", { videoUrl });

    // Resolved once here so it's available for every usage event reported
    // during this run, not just the one below.
    const [project] = await db
      .select({ organizationSlug: channelsTable.organizationSlug })
      .from(projectsTable)
      .innerJoin(channelsTable, eq(projectsTable.channelId, channelsTable.id))
      .where(eq(projectsTable.id, projectId));

    const convertVideoToMp3TaskResponse = await tasks.triggerAndWait<
      typeof convertVideoToMp3Task
    >("convert-video-to-mp3", {
      videoUrl,
      basePathToSaveOnR2: "",
      type: "project",
      projectId,
    });

    const { ok: hasConvertVideoTop3TaskCompleted } =
      convertVideoToMp3TaskResponse;

    if (!hasConvertVideoTop3TaskCompleted) {
      return;
    }

    const { audioUrl } = convertVideoToMp3TaskResponse.output;

    metadata.set("status", "PROCESSING");

    const transcribeAudioTaskResponse = await tasks.triggerAndWait<
      typeof transcribeAudioTask
    >("transcribe-audio", {
      audioUrl,
      projectId,
      type: "project",
    });

    const { ok: hasTranscribeAudioTaskCompleted } = transcribeAudioTaskResponse;

    if (!hasTranscribeAudioTaskCompleted) {
      return;
    }

    const { transcription, words } = transcribeAudioTaskResponse.output;

    logger.log("Transcription generated: ", { transcription });

    const formattedTranscription = transcription
      .map((s) => `[${s.start.toFixed(2)} - ${s.end.toFixed(2)}] ${s.text.trim()}`)
      .join("\n");

    const prompt = `
      Act as a vertical video editor focused on audience retention.

      Your goal is to analyze the transcript below and identify segments of 30 to 45 seconds that have a complete beginning, middle, and end, and that make absolute sense with no prior context.

      Input variables:
      - Transcript: the transcript below, with timestamps.

      Follow these instructions strictly:

      1. List up to 20 of the best standalone moments in the transcript. Return fewer if there are not enough good ones. Never pad the list with weak or short moments.
      2. For each moment, provide:
         - The exact start timestamp (startTime) and end timestamp (endTime)
         - An SEO-optimized title for the video
         - An SEO-optimized description for the video
         - A list of relevant tags (keywords) for the video

      How to build a moment (critical):
      - Each transcript line is a short segment (usually only 2 to 8 seconds). A moment is a sequence of CONSECUTIVE transcript lines combined together.
      - startTime = the START timestamp of the FIRST line of the moment.
      - endTime = the END timestamp of the LAST line of the moment.
      - endTime - startTime MUST be between 30 and 45 seconds. A single line is never enough: keep adding the next consecutive lines until the total duration reaches at least 30 seconds, and stop before it exceeds 45 seconds.
      - Before answering, compute endTime - startTime for every moment. Discard or adjust any moment whose duration is below 30 or above 45 seconds.

      Example: given the lines "[10.00 - 14.20] ...", "[14.20 - 22.80] ...", "[22.80 - 31.50] ...", "[31.50 - 41.50] ...", the moment that uses all four lines is { "startTime": 10.00, "endTime": 41.50 } (duration 31.5s, valid). Using only "[10.00 - 14.20]" (4.2s) would be INVALID.

      Mandatory rules:
      - Use only words spoken in the transcript to define the literal sentences. Never invent or adapt speech.
      - startTime and endTime must be copied exactly from the start of a line and the end of a line in the transcript. Never invent timestamps that do not appear in the input.
      - The title and description must be written in the same language and the same regional variant (country) as the transcript, for example Brazilian Portuguese if the transcript is in Brazilian Portuguese. Never translate them into another language or variant.
      - The tags must also be written in the same language and regional variant as the transcript. Provide between 3 and 8 short, relevant tags per moment, without the "#" symbol.

      Output format:
      Return ONLY a raw JSON array — no markdown, no code blocks, no explanation.
      Each element must follow this exact structure:
      { "startTime": number, "endTime": number, "title": string, "description": string, "tags": string[] }

      - "startTime" and "endTime": timestamps in seconds, taken from the transcript, with 30 <= endTime - startTime <= 45.
      - "title": the SEO-optimized title of the video.
      - "description": the SEO-optimized description of the video.
      - "tags": an array of short tags (keywords) describing the video.

      If there are no valid moments to extract, return an empty array [].

      The transcript is as follows:

      ${formattedTranscription}
    `;

    const clipsSchema = z.array(
      z.object({
        startTime: z.number(),
        endTime: z.number(),
        title: z.string(),
        description: z.string(),
        tags: z.array(z.string()),
      }),
    );

    const generateTextToken = await wait.createToken({ timeout: "10m" });

    await fetch(
      await getInfisicalSecret({ secretName: "MODAL_GENERATE_TEXT_URL" }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          callback_url: generateTextToken.url,
        }),
      },
    );

    const generateTextResult = await wait
      .forToken<ModalGenerateTextCallbackPayload>(generateTextToken)
      .unwrap();

    logger.log("Best moments generation result: ", { generateTextResult });

    // GPU é cobrada do início ao fim da execução no Modal, sucesso ou erro —
    // reporta o custo real independente do resultado.
    await setUsage({
      externalCustomerId: project.organizationSlug,
      eventName: "best_moments_generated",
      cost: generateTextResult.cost,
      metadata: { projectId },
    });

    if (generateTextResult.status === "ERROR") {
      throw new Error(
        generateTextResult.error ?? "Failed to generate best moments",
      );
    }

    const responseText = generateTextResult.text ?? "[]";
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const clips = clipsSchema.parse(JSON.parse(cleaned));

    const bestMoments = clips.map((clip) => ({
      ...clip,
      words: words.filter(
        (w) => w.start >= clip.startTime && w.start <= clip.endTime,
      ),
    }));

    logger.log("Best moments generated: ", { bestMoments });

    for (let i = 0; i < bestMoments.length; i++) {
      const { startTime, endTime, title, words, description, tags } =
        bestMoments[i];

      const token = await wait.createToken();

      const callbackUrl = token.url;

      const modalUrl = await getInfisicalSecret({ secretName: "MODAL_URL" })

      await fetch(modalUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          video_url: videoUrl,
          start_time: startTime,
          end_time: endTime,
          title: title,
          callback_url: callbackUrl,
          words: words
        }),
      })

      const result = await wait.forToken<ModalCallbackPayload>(token).unwrap();

      logger.log("Result: ", { result });

      await setUsage({
        cost: result.cost,
        eventName: "clip_rendered",
        externalCustomerId: project.organizationSlug,
        metadata: {
          projectId,
          title,
        },
      })

      const [bestMoment] = await db
        .insert(bestMomentsTable)
        .values({
          title,
          description,
          storageKey: result.output_key,
          size: result.size,
          startTime,
          endTime,
          projectId: projectId,
        })
        .returning({ id: bestMomentsTable.id });

      if (tags.length > 0) {
        await db.insert(tagsTable).values(
          tags.map((name) => ({
            name,
            bestMomentId: bestMoment.id,
          })),
        );
      }

    }

  },
});
