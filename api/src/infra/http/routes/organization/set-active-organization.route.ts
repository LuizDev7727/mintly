import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";
import { setActiveOrganization } from "@/functions/organization/set-active-organization.ts";

export const setActiveOrganizationRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.put(
    "/api/organization/active",
    {
      preHandler: [checkUserSession],
      schema: {
        body: z.object({
          organizationSlug: z.string(),
        }),
        response: {
          200: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { organizationSlug } = request.body;

      const span = tracer.startSpan("get-active-organization");
      span.setAttribute("organization-slug", organizationSlug);

      await setActiveOrganization({
        organizationSlug,
        sessionId: request.session.id,
      });

      span.end();

      return reply.status(200).send();
    },
  );
};
