import { updateFolder } from "@/functions/folder/update-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const updateFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/folders/:folderId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
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
      const { folderId } = request.params;
      const { title } = request.body;

      const span = tracer.startSpan("update-folder");
      span.setAttribute("folder.id", folderId);

      await updateFolder({ folderId, title });

      span.end();

      return reply.status(204).send();
    },
  );
};
