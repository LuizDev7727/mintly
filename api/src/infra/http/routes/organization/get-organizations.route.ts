import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";
import { getOrganizations } from "@/functions/organization/get-organizations.ts";

export const getOrganizationsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations",
    {
      preHandler: [checkUserSession],
      schema: {
        response: {
          200: z.object({
            organizations: z.array(
              z.object({
                id: z.uuidv7(),
                name: z.string(),
                slug: z.string(),
                membersCount: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.user;

      const span = tracer.startSpan("get-organizations");
      span.setAttribute("organization-id", id);

      const { organizations } = await getOrganizations({ userId: id });

      span.setAttribute("total-organizations", organizations.length);
      span.end();

      return reply.status(200).send({ organizations });
    },
  );
};
