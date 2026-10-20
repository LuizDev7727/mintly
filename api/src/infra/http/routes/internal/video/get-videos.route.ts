import { getVideos } from "@/functions/video/get-videos.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const getVideosRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/videos",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.coerce.number().int().min(0).default(0),
        }),
        response: {
          200: z.object({
            videos: z.array(
              z.object({
                id: z.string(),
                filename: z.string(),
                status: z.enum(["READY", "GENERATING", "FAILED"]),
                createdAt: z.date(),
              }),
            ),
            meta: z.object({
              totalCount: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { pageIndex } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("getVideos");
      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { videos, meta } = await getVideos({
        organizationSlug: slug,
        channelId,
        pageIndex,
      });

      span.setAttribute("videos-count", videos.length);
      span.end();

      return reply.status(200).send({ videos, meta });
    },
  );
};
