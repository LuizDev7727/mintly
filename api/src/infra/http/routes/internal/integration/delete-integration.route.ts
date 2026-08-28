import { deleteIntegration } from "@/functions/integration/delete-integration.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const deleteIntegrationRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/organizations/:slug/channels/:channelId/integrations/:integrationId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
          integrationId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { slug, integrationId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("delete-integration");
      span.setAttribute("integration.id", integrationId);

      await checkMembership({ organizationSlug: slug, userId });

      await deleteIntegration({
        integrationId
      });

      span.end();

      return reply.status(204).send();
    },
  );
};
