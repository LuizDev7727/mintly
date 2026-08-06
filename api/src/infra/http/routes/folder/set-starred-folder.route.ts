import { trace } from "@opentelemetry/api";
import { setStarredFolder } from "@/functions/folder/set-starred-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const setStarredFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:orgSlug/channels/:channelId/starred-folders",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
        }),
        body: z.object({
          folderId: z.string(),
        }),
        response: {
          201: z.object({
            starredFolderId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { folderId } = request.body;

      const span = tracer.startSpan("set-starred-folder");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("folder.id", folderId);

      const { starredFolderId } = await setStarredFolder({
        folderId,
        channelId,
      });

      span.end();

      trace
        .getActiveSpan()
        ?.setAttribute("starred_folder.id", starredFolderId);

      return reply.status(201).send({ starredFolderId });
    },
  );
};
