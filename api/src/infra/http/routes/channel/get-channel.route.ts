import { getChannel } from "@/functions/channel/get-channel.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/channels/:channelId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          channelId: z.string(),
        }),
        response: {
          200: z.object({
            id: z.string(),
            name: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;

      const span = tracer.startSpan("get-channel");
      span.setAttribute("channel.id", channelId);

      const channel = await getChannel({ channelId });

      span.end();

      return reply.status(200).send(channel);
    },
  );
};
