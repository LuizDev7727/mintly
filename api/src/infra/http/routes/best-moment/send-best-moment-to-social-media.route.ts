import { sendBestMomentToSocialMedia } from "@/functions/best-moment/send-best-moment-to-social-media.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const sendBestMomentToSocialMediaRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/channels/:channelId/best-moments/:bestMomentId/send",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          channelId: z.string(),
          bestMomentId: z.string(),
        }),
        body: z.object({
          integrationId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { channelId, bestMomentId } = request.params;
      const { integrationId } = request.body;
      const ownerId = request.user.id;

      const span = tracer.startSpan("send-best-moment-to-social-media");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("best-moment.id", bestMomentId);
      span.setAttribute("integration.id", integrationId);

      await sendBestMomentToSocialMedia({
        channelId,
        bestMomentId,
        integrationId,
        ownerId,
      });

      span.end();

      return reply.status(204).send();
    },
  );
};
