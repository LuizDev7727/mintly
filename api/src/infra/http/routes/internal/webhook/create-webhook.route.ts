import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { createWebhook } from "@/functions/webhook/create-webhook.ts";
import { webhookEventTrigger } from "@/infra/db/tables/webhooks.table.ts";
import { tracer } from "../../../tracer/tracer.ts";

export const createWebhookRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/webhooks",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          url: z.url("Enter a valid URL."),
          triggers: z.array(webhookEventTrigger).min(1),
        }),
        response: {
          201: z.object({
            id: z.string(),
            signingKey: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { url, triggers } = request.body;

      const span = tracer.startSpan("create-webhook");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("webhook-url", url);

      const { id, signingKey } = await createWebhook({
        orgSlug: slug,
        url,
        triggers,
      });

      span.setAttribute("webhook-id", id);
      span.end();

      return reply.status(201).send({ id, signingKey });
    },
  );
};
