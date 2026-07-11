import { deleteIntegration } from "@/functions/integration/delete-integration.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const deleteIntegrationRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/integrations/:integrationId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          integrationId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { integrationId } = request.params;

      const span = tracer.startSpan("delete-integration");
      span.setAttribute("integration.id", integrationId);

      await deleteIntegration({
        integrationId
      });

      span.end();

      return reply.status(204).send();
    },
  );
};
