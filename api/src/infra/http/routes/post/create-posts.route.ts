import { createPosts } from "@/functions/posts/create-posts.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { createActivity } from "@/utils/create-activity.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const createPostsRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/channels/:channelId/posts",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          channelId: z.string(),
        }),
        body: z.object({
          posts: z
            .array(
              z.object({
                file: z.object({
                  name: z.string(),
                  key: z.string(),
                  type: z.string(),
                  size: z.number(),
                  duration: z.number().nullable(),
                }),
                shouldGenerateThumbnail: z.boolean(),
                shouldGenerateShorts: z.boolean(),
                scheduledTo: z.string().nullable(),
                socialsToPost: z
                  .array(
                    z.object({
                      id: z.string(),
                      name: z.string(),
                      provider: z.enum(["YOUTUBE", "TIKTOK"]),
                    }),
                  )
                  .min(1, {
                    error: "Post needs at least one integration selected",
                  }),
              }),
            )
            .min(1),
        }),
        response: {
          201: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { posts } = request.body;
      const { activeOrganizationId } = request.session;

      const span = tracer.startSpan("createPosts");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("posts.count", posts.length);

      await createPosts({
        posts,
        ownerId: request.user.id,
        channelId,
      });

      await createActivity({
        action: "CREATED_POST",
        authorId: request.user.id,
        description:
          posts.length === 1
            ? `Created post ${posts[0].file.name}`
            : `Created ${posts.length} posts`,
        orgSlug: activeOrganizationId,
      });

      span.end();

      return reply.status(201).send();
    },
  );
};
