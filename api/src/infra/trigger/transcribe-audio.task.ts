import { logger, wait, schemaTask } from "@trigger.dev/sdk";
import { z } from "zod";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";
import { db } from "../db/client.ts";
import { env } from "@/env.ts";

type ModalTranscribeAudioCallbackPayload = {
  status: "SUCCESS" | "ERROR";
  segments?: {
    start: number;
    end: number;
    text: string;
    avg_logprob: number;
    words: {
      word: string;
      start: number;
      end: number;
      score: number;
    }[];
  }[];
  language?: string;
  error?: string;
}

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

    await fetch(env.MODAL_TRANSCRIBE_AUDIO_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        audio_url: audioUrl,
        callback_url: token.url,
      }),
    })

    const result = await wait.forToken<ModalTranscribeAudioCallbackPayload>(token).unwrap();

    logger.log("Result: ", { result });

    const transcription = result.segments ?? [];
    const allWords = transcription.flatMap((s) => s.words ?? []);

    return {
      transcription,
      words: allWords,
    };
  },
});
