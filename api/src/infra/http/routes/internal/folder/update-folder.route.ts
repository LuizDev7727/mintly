import { updateFolder } from "@/functions/folder/update-folder.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const updateFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/organizations/:slug/channels/:channelId/folders/:folderId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
          folderId: z.string(),
        }),
        body: z.object({
          title: z.string().min(1),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug, folderId } = request.params;
      const { title } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("update-folder");
      span.setAttribute("folder.id", folderId);

      await checkMembership({ organizationSlug: slug, userId });

      await updateFolder({ folderId, title });

      span.end();

      return reply.status(204).send();
    },
  );
};
