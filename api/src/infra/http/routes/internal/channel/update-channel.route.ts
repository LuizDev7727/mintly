import { updateChannel } from "@/functions/channel/update-channel.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const updateChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
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
        body: z.object({
          name: z.string().min(1),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { name } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("update-channel");
      span.setAttribute("channel.id", channelId);

      await checkMembership({
        organizationSlug: slug,
        userId
      })

      await updateChannel({ channelId, name });

      span.end();

      return reply.status(204).send();
    },
  );
};
