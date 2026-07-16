import { logger, schemaTask, tasks, wait } from "@trigger.dev/sdk";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/infra/db/client.ts";
import { projectsTable } from "../db/tables/projects.table.ts";
import { transcribeAudioTask } from "./transcribe-audio.task.ts";
import { convertVideoToMp3Task } from "./convert-video-to-mp3.task.ts";
import { googleAi } from "@/lib/google.ts";

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
    await db
      .update(projectsTable)
      .set({
        status: "SUCCESS",
      })
      .where(eq(projectsTable.id, projectId));
  },

  onFailure: async ({ payload }) => {
    const { projectId } = payload;
    await db
      .update(projectsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(projectsTable.id, projectId));
  },

  onCancel: async ({ payload }) => {
    const { projectId } = payload;
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
    const { projectId, videoUrl } = payload;

    logger.log("ProjectId created: ", { projectId });
    logger.log("VideoUrl: ", { videoUrl });

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

    const prompt = `
      This is a podcast video transcript consisting of words, along with each word's start time, end time, and confidence score. I am looking to create clips between a minimum of 30 and maximum of 60 seconds long. The clip should never exceed 60 seconds.

      Your task is to find and extract stories, or questions and their corresponding answers from the transcript.
      Each clip should begin with the question and conclude with the answer.
      It is acceptable for the clip to include a few additional sentences before a question if it aids in contextualizing the question.

      Please adhere to the following rules:
      - Ensure that clips do not overlap with one another.
      - Start and end timestamps of the clips should align perfectly with the sentence boundaries in the transcript.
      - Only use the start and end timestamps provided in the input. Modifying timestamps is not allowed.
      - Aim to generate longer clips between 40-60 seconds, and ensure to include as much content from the context as viable.
      - Aim to generate more than 10 clips.

      Avoid including:
      - Moments of greeting, thanking, or saying goodbye.
      - Non-question and answer interactions.

      Output format:
      Return ONLY a raw JSON array — no markdown, no code blocks, no explanation.
      Each element must follow this exact structure:
      { "startTime": number, "endTime": number, "title": string }

      - "title": generate a descriptive title based on the clip's content.

      If there are no valid clips to extract, return an empty array [].

      The transcript is as follows:\n\n""" + ${transcription}
    `;

    const clipsSchema = z.array(
      z.object({
        startTime: z.number(),
        endTime: z.number(),
        title: z.string(),
      }),
    );

    const response = await googleAi.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const responseText = response.text ?? "[]";
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
      const { startTime, endTime, title, words } = bestMoments[i];


    }

  },
});
