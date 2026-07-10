import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";
import { createOrganization } from "@/functions/organization/create-organization.ts";
import { createSlug } from "@/lib/create-slug.ts";

export const createOrganizationRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations",
    {
      preHandler: [checkUserSession],
      schema: {
        body: z.object({
          name: z.string(),
          slug: z.string(),
        }),
        response: {
          200: z.object({
            organizationId: z.uuidv7(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { name, slug } = request.body;

      const span = tracer.startSpan("create-organization");
      span.setAttribute("name", name);
      span.setAttribute("slug", slug);

      const { organizationId } = await createOrganization({
        userId: request.user.id,
        name,
        slug: createSlug(name),
      });

      span.end();

      return reply.status(200).send({
        organizationId,
      });
    },
  );
};
