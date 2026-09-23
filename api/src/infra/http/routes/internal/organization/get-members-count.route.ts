import { getMembersCount } from "@/functions/organization/get-members-count.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getMembersCountRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/members/count",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            count: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-members-count");
      span.setAttribute("organization-slug", slug);

      await checkMembership({ organizationSlug: slug, userId });

      const { count } = await getMembersCount({ orgSlug: slug });

      span.setAttribute("members-count", count);
      span.end();

      return reply.status(200).send({ count });
    },
  );
};
