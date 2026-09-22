import { getOrganizationPendingInvites } from "@/functions/organization/get-organization-pending-invites.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getOrganizationPendingInvitesRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/organizations/:slug/invites/pending",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.coerce.number().int().min(0).default(0),
        }),
        response: {
          200: z.object({
            pendingInvites: z.array(
              z.object({
                id: z.string(),
                email: z.string(),
                role: z.string().nullable(),
                createdAt: z.date(),
              }),
            ),
            meta: z.object({
              totalCount: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { pageIndex } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-organization-pending-invites");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("page-index", pageIndex);

      await checkMembership({ organizationSlug: slug, userId });

      const { pendingInvites, meta } = await getOrganizationPendingInvites({
        orgSlug: slug,
        pageIndex,
      });

      span.setAttribute("pending-invites-count", pendingInvites.length);
      span.end();

      return reply.status(200).send({ pendingInvites, meta });
    },
  );
};
