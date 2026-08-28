import { cancelPost } from "@/functions/posts/cancel-post.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const cancelPostRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/organizations/:slug/channels/:channelId/posts/:postId/cancel",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
          postId: z.string(),
        }),
        body: z.object({
          runId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { slug, postId } = request.params;
      const { runId } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("cancel-post");
      span.setAttribute("post.id", postId);

      await checkMembership({ organizationSlug: slug, userId });

      await cancelPost({ postId, runId });

      span.end();

      return reply.status(204).send();
    },
  );
};
