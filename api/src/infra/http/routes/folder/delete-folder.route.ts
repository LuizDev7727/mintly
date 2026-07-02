import { deleteFolder } from "@/functions/folder/delete-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const deleteFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/folders/:folderId",
    {
      preHandler: [],
      schema: {
        params: z.object({
          folderId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { folderId } = request.params;

      const span = tracer.startSpan("delete-folder");
      span.setAttribute("folder.id", folderId);

      await deleteFolder({ folderId });

      span.end();

      return reply.status(204).send();
    },
  );
};
