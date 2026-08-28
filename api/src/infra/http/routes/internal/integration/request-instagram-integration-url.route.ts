import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { tracer } from "../../../tracer/tracer.ts";
import { requestInstagramIntegrationUrl } from "@/functions/integration/request-instagram-integration-url.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const requestInstagramIntegrationUrlRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/integrations/instagram/request-url",
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
            url: z.url(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("request-instagram-integration-url");

      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { url } = requestInstagramIntegrationUrl({
        orgSlug: slug,
        channelId,
      });

      span.end();

      return reply.status(200).send({ url });
    },
  );
};
