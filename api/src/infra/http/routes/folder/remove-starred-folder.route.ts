import { removeStarredFolder } from "@/functions/folder/remove-starred-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const removeStarredFolderRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.delete(
    "/api/organizations/:orgSlug/channels/:channelId/starred-folders/:folderId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
          folderId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { channelId, folderId } = request.params;

      const span = tracer.startSpan("remove-starred-folder");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("folder.id", folderId);

      await removeStarredFolder({ folderId, channelId });

      span.end();

      return reply.status(204).send();
    },
  );
};
