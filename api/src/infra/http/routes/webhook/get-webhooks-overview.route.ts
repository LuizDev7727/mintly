import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { getWebhooksOverviews } from "@/functions/webhook/get-webhooks-overviews.ts";
import { tracer } from "../../tracer/tracer.ts";

const metricSchema = z.object({
  value: z.number(),
  trend: z.number(),
  sparkline: z.array(z.number()),
});

const webhookLogStatusSchema = z.enum(["PENDING", "SUCCESS", "FAILED"]);

const recentDeliverySchema = z.object({
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
  createdAt: z.date(),
});

const webhookSummarySchema = z.object({
  id: z.string(),
  url: z.string(),
  triggers: z.array(z.string()),
  signingSecret: z.string(),
  createdAt: z.date(),
  lastLog: z
    .object({
      status: webhookLogStatusSchema,
      createdAt: z.date(),
    })
    .nullable(),
});

export const getWebhooksOverviewRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/webhooks/metrics",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            metrics: z.object({
              totalDeliveries: metricSchema,
              successful: metricSchema,
              failed: metricSchema,
              pending: metricSchema,
              retryRate: metricSchema,
            }),
            recentDeliveries: z.array(recentDeliverySchema),
            webhooks: z.array(webhookSummarySchema),
            apiKey: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const span = tracer.startSpan("get-webhooks-overview");
      span.setAttribute("organization-slug", slug);

      const { metrics, recentDeliveries, webhooks, apiKey } =
        await getWebhooksOverviews({ orgSlug: slug });

      span.setAttribute("total-deliveries", metrics.totalDeliveries.value);
      span.setAttribute("recent-deliveries-count", recentDeliveries.length);
      span.setAttribute("webhooks-count", webhooks.length);
      span.end();

      return reply
        .status(200)
        .send({ metrics, recentDeliveries, webhooks, apiKey });
    },
  );
};
