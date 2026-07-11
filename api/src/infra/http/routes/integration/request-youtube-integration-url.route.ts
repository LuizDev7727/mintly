import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { tracer } from "../../tracer/tracer.ts";
import { requestYoutubeIntegrationUrl } from "@/functions/integration/request-youtube-integration-url.ts";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const requestYoutubeIntegrationUrlRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/channels/:channelId/integrations/youtube/request-url",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
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
      const { channelId } = request.params;
      const { activeOrganizationId } = request.session;

      const span = tracer.startSpan("request-youtube-integration-url");

      span.setAttribute("channel.id", channelId);

      const { url } = requestYoutubeIntegrationUrl({
        orgSlug: activeOrganizationId,
        channelId,
      });

      span.end();

      return reply.status(200).send({ url });
    },
  );
};
