import { deleteInspirationalThumbnail } from "@/functions/inspirational-thumbnail/delete-inspirational-thumbnail.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const deleteInspirationalThumbnailRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.delete(
    "/api/organizations/:slug/channels/:channelId/inspirational-thumbnails/:inspirationalThumbnailId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
          inspirationalThumbnailId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { slug, inspirationalThumbnailId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("deleteInspirationalThumbnail");
      span.setAttribute("inspirational-thumbnail.id", inspirationalThumbnailId);

      await checkMembership({ organizationSlug: slug, userId });

      await deleteInspirationalThumbnail({ inspirationalThumbnailId });

      span.end();

      return reply.status(204).send();
    },
  );
};
