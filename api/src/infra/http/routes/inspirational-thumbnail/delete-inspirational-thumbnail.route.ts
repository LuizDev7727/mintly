import { deleteInspirationalThumbnail } from "@/functions/inspirational-thumbnail/delete-inspirational-thumbnail.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const deleteInspirationalThumbnailRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.delete(
    "/api/inspirational-thumbnails/:inspirationalThumbnailId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          inspirationalThumbnailId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { inspirationalThumbnailId } = request.params;

      const span = tracer.startSpan("deleteInspirationalThumbnail");
      span.setAttribute("inspirational-thumbnail.id", inspirationalThumbnailId);

      await deleteInspirationalThumbnail({ inspirationalThumbnailId });

      span.end();

      return reply.status(204).send();
    },
  );
};
