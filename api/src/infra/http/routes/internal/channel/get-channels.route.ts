import { getChannels } from "@/functions/channel/get-channels.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getChannelsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            channels: z.array(
              z.object({
                id: z.string(),
                slug: z.string(),
                name: z.string(),
                postsCount: z.number(),
                postsSeries: z.array(z.number()),
                integrationsCount: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-channels");
      span.setAttribute("org.slug", slug);

      await checkMembership({
        organizationSlug: slug,
        userId,
      })

      const { channels } = await getChannels({ orgSlug: slug });

      span.end();

      return reply.status(200).send({ channels });
    },
  );
};
