import { getUsage } from "@/functions/organization/get-usage.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getUsageRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/usage",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          startDate: z.coerce.date(),
          endDate: z.coerce.date(),
        }),
        response: {
          200: z.object({
            costs: z.object({
              currentCents: z.number(),
              previousCents: z.number(),
              changePercentage: z.number(),
            }),
            storage: z.object({
              currentBytes: z.number(),
              previousBytes: z.number(),
              changePercentage: z.number(),
            }),
            series: z.array(
              z.object({
                date: z.string(),
                clipRendered: z.number(),
                thumbnailGenerated: z.number(),
                seoGenerated: z.number(),
                audioTranscribed: z.number(),
                bestMomentsGenerated: z.number(),
              }),
            ),
            storageSeries: z.array(
              z.object({
                date: z.string(),
                storage: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { startDate, endDate } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("getUsage");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("start-date", startDate.toISOString());
      span.setAttribute("end-date", endDate.toISOString());

      await checkMembership({ organizationSlug: slug, userId });

      const { costs, storage, series, storageSeries } = await getUsage({
        organizationSlug: slug,
        startDate,
        endDate,
      });

      span.end();

      return reply.status(200).send({ costs, storage, series, storageSeries });
    },
  );
};
