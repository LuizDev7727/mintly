import { createPosts } from "@/functions/posts/create-posts.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { createActivity } from "@/utils/create-activity.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { publishWebhookEvents } from "@/webhooks/publish-webhook.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const createPostsRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/posts",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
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
                      provider: z.enum(["YOUTUBE", "TIKTOK", "INSTAGRAM"]),
                      avatarUrl: z.string().nullable(),
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
      const { slug, channelId } = request.params;
      const { posts } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("createPosts");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("posts.count", posts.length);

      await checkMembership({ organizationSlug: slug, userId });

      await createPosts({
        posts,
        ownerId: userId,
        channelId,
      });

      await createActivity({
        action: "CREATED_POST",
        authorId: userId,
        description:
          posts.length === 1
            ? `Created post ${posts[0].file.name}`
            : `Created ${posts.length} posts`,
        orgSlug: slug,
      });

      await publishWebhookEvents({
        orgSlug: slug,
        trigger: "post.created",
        events: [{
          message: "Post(s) created successfully."
        }]
      })

      span.end();

      return reply.status(201).send();
    },
  );
};
