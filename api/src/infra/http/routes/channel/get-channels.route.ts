import { getChannels } from "@/functions/channel/get-channels.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getChannelsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:orgSlug/channels",
    {
      preHandler: [checkUserSession]
      schema: {
        params: z.object({
          orgSlug: z.string(),
        }),
        response: {
          200: z.object({
            channels: z.array(
              z.object({
                id: z.string(),
                slug: z.string(),
                name: z.string(),
                postsCount: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { orgSlug } = request.params;

      const span = tracer.startSpan("get-channels");
      span.setAttribute("org.slug", orgSlug);

      const { channels } = await getChannels({ orgSlug });

      span.end();

      return reply.status(200).send({ channels });
    },
  );
};
