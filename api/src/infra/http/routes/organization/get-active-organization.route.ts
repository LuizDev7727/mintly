import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";
import { getOrganization } from "@/functions/organization/get-organization.ts";

export const getActiveOrganizationRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organization/active",
    {
      preHandler: [checkUserSession],
      schema: {
        response: {
          200: z.object({
            organization: z.object({
              id: z.string(),
              name: z.string(),
              slug: z.string(),
              logo: z.string().nullable(),
              billingEmail: z.string(),
              membersCount: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { activeOrganizationId } = request.session;

      const span = tracer.startSpan("get-active-organization");
      span.setAttribute("organization-id", activeOrganizationId);

      const { organization } = await getOrganization({
        organizationSlug: activeOrganizationId,
      });

      span.setAttribute("organization-name", organization.name);
      span.setAttribute("organization-slug", organization.slug);
      span.end();

      return reply.status(200).send({ organization });
    },
  );
};
