import { cancelPost } from "@/functions/posts/cancel-post.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const cancelPostRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/posts/:postId/cancel",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
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
      const { postId } = request.params;
      const { runId } = request.body;

      const span = tracer.startSpan("cancel-post");
      span.setAttribute("post.id", postId);

      await cancelPost({ postId, runId });

      span.end();

      return reply.status(204).send();
    },
  );
};
