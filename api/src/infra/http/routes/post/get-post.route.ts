import { getPost } from "@/functions/posts/get-post.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getPostRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/posts/:postId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          postId: z.string(),
        }),
        response: {
          200: z.object({
            title: z.string(),
            thumbnailUrl: z.string().nullable(),
            description: z.string(),
            createdAt: z.date(),
            size: z.number(),
            duration: z.number(),
            status: z.enum([
              "PROCESSING",
              "SCHEDULED",
              "ERROR",
              "PUBLISHED",
              "ENCODING",
              "GENERATING_METADATA",
              "GENERATING_THUMBNAIL",
              "TRANSCRIBING",
              "SEO_GENERATING",
              "PUBLISHING",
              "CANCELED",
            ]),
            author: z.object({
              name: z.string(),
              avatarUrl: z.string().nullable(),
            }),
            socialsToPost: z.array(
              z.object({
                social: z.enum(["YOUTUBE", "TIKTOK"]),
                socialName: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { postId } = request.params;

      const span = tracer.startSpan("get-post");
      span.setAttribute("post.id", postId);

      const post = await getPost({ postId });

      span.end();

      return reply.status(200).send(post);
    },
  );
};
