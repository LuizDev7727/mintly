import { movePostsToFolder } from "@/functions/posts/move-posts-to-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const movePostsToFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/organizations/:slug/channels/:channelId/posts/move-to-folder",
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
          postIds: z.array(z.string()).min(1),
          folderId: z.uuidv7().nullable(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { postIds, folderId } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("move-posts-to-folder");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("posts.count", postIds.length);

      await checkMembership({ organizationSlug: slug, userId });

      await movePostsToFolder({ channelId, postIds, folderId });

      span.end();

      return reply.status(204).send();
    },
  );
};
