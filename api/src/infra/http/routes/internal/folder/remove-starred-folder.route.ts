import { removeStarredFolder } from "@/functions/folder/remove-starred-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const removeStarredFolderRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.delete(
    "/api/organizations/:slug/channels/:channelId/starred-folders/:folderId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.uuidv7(),
          folderId: z.uuidv7(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId, folderId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("remove-starred-folder");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("folder.id", folderId);

      await checkMembership({
        organizationSlug: slug,
        userId
      })

      await removeStarredFolder({ folderId, channelId });

      span.end();

      return reply.status(204).send();
    },
  );
};
