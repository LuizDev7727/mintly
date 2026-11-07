import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { getColors } from "@/functions/color/get-colors.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const getColorsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/colors",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.uuidv7(),
        }),
        response: {
          200: z.object({
            colors: z.array(
              z.object({
                id: z.string(),
                hex: z.string(),
                createdAt: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;

      const span = tracer.startSpan("get-colors");
      span.setAttribute("channel.id", channelId);

      const { colors } = await getColors({ channelId });

      span.end();

      return reply.status(200).send({ colors });
    },
  );
};
