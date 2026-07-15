import { logger, wait, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { replicate } from "@/lib/replicate.ts";
import type { Prediction } from "replicate";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";

export const transcribeAudioTask = schemaTask({
  id: "transcribe-audio",
  schema: z.discriminatedUnion("type", [
    z.object({
      audioUrl: z.url(),
      type: z.literal("post"),
      postId: z.uuidv7(),
    }),
    z.object({
      audioUrl: z.url(),
      type: z.literal("project"),
      projectId: z.uuidv7(),
    }),
  ]),

  onStart: async ({ payload }) => {
    const { type } = payload;

    if (type === 'post') {
      await db
      .update(postsTable)
      .set({
        status: "TRANSCRIBING",
      })
      .where(eq(postsTable.id, payload.postId));
    } else {
      await db
      .update(postsTable)
      .set({
        status: "TRANSCRIBING",
      })
      .where(eq(postsTable.id, payload.projectId));
    }
  },

  onFailure: async ({ payload }) => {
    const { type } = payload;
    if (type === 'post') {
      await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, payload.postId));
    } else {
      await db
      .update(postsTable)
      .set({
        status: "ERROR",
      })
      .where(eq(postsTable.id, payload.projectId));
    }
  },

  // Set an optional maxDuration to prevent tasks from running indefinitely
  maxDuration: 300, // Stop executing after 300 secs (5 mins) of compute
  run: async (payload, { ctx }) => {
    // The payload contains the last run timestamp that you can use to check if this is the first run
    // And calculate the time since the last run

    const { audioUrl } = payload;

    logger.log("Audio URL: ", { audioUrl });

    const token = await wait.createToken({
      timeout: "10m",
    });

    await replicate.run(
      "victor-upmeet/whisperx-a40-large:1395a1d7aa48a01094887250475f384d4bae08fd0616f9c405bb81d4174597ea",
      {
        input: {
          debug: false,
          language: "pt",
          vad_onset: 0.5,
          audio_file: audioUrl,
          batch_size: 64,
          vad_offset: 0.363,
          diarization: false,
          temperature: 0,
          align_output: false,
          language_detection_min_prob: 0,
          language_detection_max_tries: 5,
        },
        webhook: token.url,
        webhook_events_filter: ["completed"],
      },
    );

    const result = await wait.forToken<Prediction>(token).unwrap();

    const segments = result.output.segments ?? [];
    const allWords = segments.flatMap((s) => s.words ?? []);

    const transcription = JSON.stringify(segments);

    return {
      transcription,
      words: allWords,
    };
  },
});
