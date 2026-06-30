import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { getMetrics } from "@/functions/organization/get-metrics.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getOrganizationMetricsRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organizations/:slug/metrics",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            metrics: z.object({
              totalChannels: z.number(),
              totalMembers: z.number(),
              totalUsage: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const span = tracer.startSpan("get-organization-metrics");
      span.setAttribute("organization-slug", slug);

      const { metrics } = await getMetrics({ orgSlug: slug });

      span.setAttribute("total-channels", metrics.totalChannels);
      span.setAttribute("total-members", metrics.totalMembers);
      span.setAttribute("total-usage", metrics.totalUsage);
      span.end();

      return reply.status(200).send({ metrics });
    },
  );
};
