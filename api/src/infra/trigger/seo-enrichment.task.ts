import { logger, wait, schemaTask } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { db } from "@/infra/db/client.ts";
import { postsTable } from "@/infra/db/tables/posts.table.ts";
import { channelsTable } from "@/infra/db/tables/channels.table.ts";
import { eq } from "drizzle-orm";
import { setUsage } from "@/utils/polar/set-usage.ts";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";

const seoResponseSchema = z.object({
  title: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
});

type ModalGenerateTextCallbackPayload = {
  status: "SUCCESS" | "ERROR";
  text?: string;
  error?: string;
  cost: {
    amount: number;
    currency: string;
  };
};

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

  // Bumped from 120s: the Modal container can take a while on a cold start
  // (Qwen2.5 7B weights), and this budget only counts active compute time —
  // time spent suspended in wait.forToken doesn't count against it.
  maxDuration: 300,
  run: async (payload) => {
    const { postId, transcription } = payload;

    const [post] = await db
      .select({ organizationSlug: channelsTable.organizationSlug })
      .from(postsTable)
      .innerJoin(channelsTable, eq(postsTable.channelId, channelsTable.id))
      .where(eq(postsTable.id, postId));

    const prompt = `
      Analyze the text of the provided audio transcription and generate an SEO-optimized title and description.

      The output must be returned strictly as a JSON object containing the properties "title", "description" and "tags".
      The title should be concise, clear, engaging, and relevant for search engines.
      The description should be accurate, well-structured, aligned with the transcription content, and optimized for SEO.
      The tags should be an array of strings with relevant keywords for search engines.
      All fields must be written in the same language as the transcription.
      Return only the final JSON object with no additional explanations, no markdown code fences, and no extra text before or after the JSON.

      The transcript is as follows:\n\n

      """
      ${transcription.map((s) => s.text).join(" ")}
      """
    `;

    const token = await wait.createToken({ timeout: "10m" });

    await fetch(
      await getInfisicalSecret({ secretName: "MODAL_GENERATE_TEXT_URL" }),
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          callback_url: token.url,
        }),
      },
    );

    const result = await wait
      .forToken<ModalGenerateTextCallbackPayload>(token)
      .unwrap();

    logger.log("SEO generation result: ", { result });

    // GPU é cobrada do início ao fim da execução no Modal, sucesso ou erro —
    // reporta o custo real independente do resultado.
    await setUsage({
      externalCustomerId: post.organizationSlug,
      eventName: "seo_generated",
      cost: result.cost,
      metadata: { postId },
    });

    if (result.status === "ERROR") {
      throw new Error(result.error ?? "Failed to generate SEO content");
    }

    const rawText = result.text ?? "";
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
