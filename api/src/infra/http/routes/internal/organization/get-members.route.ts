import { getMembers } from "@/functions/organization/get-members.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getMembersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/members",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          // Omitted = the whole list (sidebar avatars and owner filters).
          pageIndex: z.coerce.number().int().min(0).optional(),
        }),
        response: {
          200: z.object({
            members: z.array(
              z.object({
                id: z.string(),
                role: z.string(),
                createdAt: z.date(),
                user: z.object({
                  id: z.string(),
                  name: z.string(),
                  email: z.string(),
                  avatarUrl: z.string().nullable(),
                  bio: z.string().nullable(),
                }),
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

      const span = tracer.startSpan("get-members");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("page-index", pageIndex ?? "No pagination");

      await checkMembership({ organizationSlug: slug, userId });

      const { members, meta } = await getMembers({
        orgSlug: slug,
        pageIndex,
      });

      span.setAttribute("members-count", members.length);
      span.end();

      return reply.status(200).send({ members, meta });
    },
  );
};
