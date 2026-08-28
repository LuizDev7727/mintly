import { getPost } from "@/functions/posts/get-post.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getPostRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/posts/:postId",
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
      const { slug, postId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-post");
      span.setAttribute("post.id", postId);

      await checkMembership({ organizationSlug: slug, userId });

      const post = await getPost({ postId });

      span.end();

      return reply.status(200).send(post);
    },
  );
};
