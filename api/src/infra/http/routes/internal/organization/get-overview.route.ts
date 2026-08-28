import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { getOverview } from "@/functions/organization/get-overview.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getOrganizationOverviewRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organizations/:slug/overview",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            overview: z.object({
              channelsCount: z.number(),
              membersCount: z.number(),
              usage: z.object({
                totalUsage: z.number(),
                series: z.array(z.number()),
              }),
              storage: z.object({
                totalStorage: z.number(),
                series: z.array(z.number()),
              }),
              channels: z.array(
                z.object({
                  id: z.string(),
                  name: z.string(),
                  totalPosts: z.number(),
                }),
              ),
              recentActivities: z.array(
                z.object({
                  action: z.string(),
                  description: z.string(),
                  createdAt: z.string(),
                  author: z.object({
                    name: z.string(),
                    avatarUrl: z.string().nullable(),
                  }),
                }),
              ),
              webhooks: z.array(
                z.object({
                  id: z.string(),
                  url: z.string(),
                }),
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-organization-overview");
      span.setAttribute("organization-slug", slug);

      await checkMembership({ organizationSlug: slug, userId });

      const { overview } = await getOverview({ orgSlug: slug });

      span.setAttribute("channels-count", overview.channelsCount);
      span.setAttribute("members-count", overview.membersCount);
      span.setAttribute("total-usage", overview.usage.totalUsage);
      span.end();

      return reply.status(200).send({ overview });
    },
  );
};
