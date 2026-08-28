import { deleteChannel } from "@/functions/channel/delete-channel.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const deleteChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/organizations/:slug/channels/:channelId",
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
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("delete-channel");
      span.setAttribute("channel.id", channelId);

      await checkMembership({
        organizationSlug: slug,
        userId
      })

      await deleteChannel({ channelId });

      span.end();

      return reply.status(204).send();
    },
  );
};
