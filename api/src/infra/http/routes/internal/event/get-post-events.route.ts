import { getPostEvents } from "@/functions/events/get-post-events.ts";
import { postEventStatusEnum } from "@/infra/db/tables/post-events.table.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const getPostEventsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/posts/:postId/events",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
          postId: z.string(),
        }),
        response: {
          200: z.object({
            postEvents: z.array(
              z.object({
                id: z.string(),
                status: z.enum(postEventStatusEnum.enumValues),
                createdAt: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId, postId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-post-events");
      span.setAttribute("post.id", postId);

      await checkMembership({ organizationSlug: slug, userId });

      const { postEvents } = await getPostEvents({ channelId, postId });

      span.end();

      return reply.status(200).send({ postEvents });
    },
  );
};
