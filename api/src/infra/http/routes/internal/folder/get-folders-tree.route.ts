import { getFoldersTree } from "@/functions/folder/get-folders-tree.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const getFoldersTreeRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/folders/tree",
    {
      preHandler: [checkUserSession],
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
                parentId: z.string().nullable(),
                depth: z.number(),
                postsCount: z.number(),
                isStarred: z.boolean(),
                hasChildren: z.boolean(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-folders-tree");
      span.setAttribute("channel.id", channelId);

      await checkMembership({ organizationSlug: slug, userId });

      const { folders } = await getFoldersTree({ channelId });

      span.end();

      return reply.status(200).send({ folders });
    },
  );
};
