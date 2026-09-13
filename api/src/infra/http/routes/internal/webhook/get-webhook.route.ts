import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { getWebhook } from "@/functions/webhook/get-webhook.ts";
import { webhookEventTrigger } from "@/infra/db/tables/webhooks.table.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

const webhookLogStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);

const webhookLogSchema = z.object({
  id: z.string(),
  url: z.string(),
  status: webhookLogStatusSchema,
  method: z.string(),
  pathname: z.string(),
  ip: z.string(),
  statusCode: z.number(),
  contentType: z.string().nullable(),
  contentLength: z.number().nullable(),
  queryParams: z.record(z.string(), z.string()).nullable(),
  headers: z.record(z.string(), z.string()),
  body: z.string().nullable(),
  errorReason: z.string().nullable(),
  numberOfRetries: z.number(),
  createdAt: z.date(),
  finishedAt: z.date().nullable(),
});

export const getWebhookRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/webhooks/:webhookId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          webhookId: z.string(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            url: z.string(),
            triggers: z.array(webhookEventTrigger),
            signingSecret: z.string(),
            createdAt: z.date(),
            logs: z.array(webhookLogSchema),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, webhookId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-webhook");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("webhook-id", webhookId);

      await checkMembership({ organizationSlug: slug, userId });

      const webhook = await getWebhook({ webhookId });

      span.setAttribute("logs-count", webhook.logs.length);
      span.end();

      return reply.status(200).send(webhook);
    },
  );
};
