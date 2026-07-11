import { updateChannel } from "@/functions/channel/update-channel.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const updateChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/channels/:channelId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
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
      const { channelId } = request.params;
      const { name } = request.body;

      const span = tracer.startSpan("update-channel");
      span.setAttribute("channel.id", channelId);

      await updateChannel({ channelId, name });

      span.end();

      return reply.status(204).send();
    },
  );
};
