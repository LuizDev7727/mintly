import { z } from "zod";

export const createWebhookSchema = z.object({
  url: z.url("Enter a valid URL."),
  triggers: z
    .array(
      z.object({
        trigger: z.union([
          z.literal("post.created"),
          z.literal("post.failed"),
          z.literal("post.posted"),
          z.literal("project.created"),
        ]),
      }),
    )
    .min(1, { error: "Select at least one event trigger." }),
});

export type CreateWebhookFormType = z.infer<typeof createWebhookSchema>;
