import { getIntegrations } from "@/functions/integration/get-integrations.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getIntegrationsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/integrations",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
        }),
        response: {
          200: z.object({
            integrations: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                avatarUrl: z.string().nullable(),
                provider: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-integrations");
      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { integrations } = await getIntegrations({
        channelId,
      });

      span.end();

      return reply.status(200).send({ integrations });
    },
  );
};
