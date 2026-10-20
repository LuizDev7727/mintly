import { createVideo } from "@/functions/video/create-video.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const generateVideoRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/videos",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
        }),
        body: z.object({
          prompt: z.string().trim().min(1).max(500),
          imageUrl: z.url({ protocol: /^https$/ }),
        }),
        response: {
          201: z.object({
            videoId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { prompt, imageUrl } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("createVideo");
      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { videoId } = await createVideo({
        organizationSlug: slug,
        channelId,
        prompt,
        imageUrl,
      });

      span.end();

      return reply.status(201).send({ videoId });
    },
  );
};
