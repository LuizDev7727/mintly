import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { tracer } from "../../../tracer/tracer.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { requestTiktokIntegrationUrl } from "@/functions/integration/request-tiktok-integration-url.ts";

export const requestTiktokIntegrationUrlRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/channels/:channelId/integrations/tiktok/request-url",
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

      const span = tracer.startSpan("request-tiktok-integration-url");

      span.setAttribute("channel.id", channelId);

      const { url } = requestTiktokIntegrationUrl({
        channelId,
        orgSlug: activeOrganizationId,
      });

      span.end();

      return reply.status(200).send({ url });
    },
  );
};
