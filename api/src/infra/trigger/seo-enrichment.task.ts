import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { googleAi } from "@/lib/google.ts";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { eq } from "drizzle-orm";

const seoResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

export const seoEnrichmentTask = schemaTask({
  id: "seo-enrichment",
  schema: z.object({
    postId: z.uuidv7(),
    transcription: z.array(
      z.object({
        end: z.number(),
        start: z.number(),
        text: z.string(),
      }),
    ),
  }),

  onStart: async ({ payload }) => {
    const { postId } = payload;
    await db
      .update(postsTable)
      .set({
        status: "SEO_GENERATING",
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

  maxDuration: 120,
  run: async (payload) => {
    const { postId, transcription } = payload;

    const prompt = `
      Analyze the text of the provided audio transcription and generate an SEO-optimized title and description.

      The output must be returned strictly as a JSON object containing the properties "title", "description" and "tags".
      The title should be concise, clear, engaging, and relevant for search engines.
      The description should be accurate, well-structured, aligned with the transcription content, and optimized for SEO.
      The tags should be an array of strings with relevant keywords for search engines.
      All fields must be written in the same language as the transcription.
      Return only the final JSON object with no additional explanations.

      The transcript is as follows:\n\n

      """
      ${transcription.map((s) => s.text).join(" ")}
      """
    `;

    const response = await googleAi.models.generateContent({
      model: "gemini-2.5-flash-lite",
      contents: prompt,
    });

    const rawText = response.text ?? "";
    const cleaned = rawText.replace(/```json|```/g, "").trim();

    const { title, description, tags } = seoResponseSchema.parse(
      JSON.parse(cleaned),
    );

    logger.log("SEO Enrichment result: ", { title, description, tags });

    await db
      .update(postsTable)
      .set({
        title,
        description,
        transcription,
      })
      .where(eq(postsTable.id, postId));

    return { title, description, tags };
  },
});
