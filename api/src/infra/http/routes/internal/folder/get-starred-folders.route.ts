import { getStarredFolders } from "@/functions/folder/get-starred-folders.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getStarredFoldersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/starred-folders",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
        }),
        response: {
          200: z.object({
            folders: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                postsCount: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-starred-folders");
      span.setAttribute("channel.id", channelId);

      await checkMembership({
        organizationSlug: slug,
        userId
      })

      const { folders } = await getStarredFolders({ channelId });

      span.end();

      return reply.status(200).send({ folders });
    },
  );
};
