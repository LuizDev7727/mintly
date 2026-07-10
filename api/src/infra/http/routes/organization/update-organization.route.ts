import { updateOrganization } from "@/functions/organization/update-organization.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";
import { checkMembership } from "@/lib/check-membership.ts";

export const updateOrganizationRoute: FastifyPluginAsyncZod = async (app) => {
  app.put(
    "/api/organizations/:slug",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          name: z.string().min(1).max(32),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { name } = request.body;

      await checkMembership({
        organizationSlug: slug,
        userId: request.user.id,
      });

      const span = tracer.startSpan("update-organization");
      span.setAttribute("organization-slug", slug);

      await updateOrganization({ slug, newName: name });

      span.end();

      return reply.status(204).send();
    },
  );
};
