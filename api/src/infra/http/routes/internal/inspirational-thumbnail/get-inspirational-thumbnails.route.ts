import { getInspirationalThumbnails } from "@/functions/inspirational-thumbnail/get-inspirational-thumbnails.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const getInspirationalThumbnailsRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/inspirational-thumbnails",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
        }),
        querystring: z.object({
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            inspirationalThumbnails: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                sizeInBytes: z.number(),
                url: z.url(),
              }),
            ),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { cursor } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("getInspirationalThumbnails");
      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { inspirationalThumbnails, nextCursor } = await getInspirationalThumbnails({
        channelId,
        cursor,
      });

      span.setAttribute("inspirational-thumbnails-count", inspirationalThumbnails.length);
      span.end();

      return reply.status(200).send({ inspirationalThumbnails, nextCursor });
    },
  );
};
