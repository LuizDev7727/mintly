import { deleteChannel } from "@/functions/channel/delete-channel.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const deleteChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/channels/:channelId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          channelId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;

      const span = tracer.startSpan("delete-channel");
      span.setAttribute("channel.id", channelId);

      await deleteChannel({ channelId });

      span.end();

      return reply.status(204).send();
    },
  );
};
