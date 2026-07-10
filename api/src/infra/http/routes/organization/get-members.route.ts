import { getMembers } from "@/functions/organization/get-members.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getMembersRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/members",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
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
                }),
              }),
            ),
            pendingInvites: z.array(
              z.object({
                id: z.string(),
                email: z.string(),
                role: z.string().nullable(),
                createdAt: z.date(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;

      const span = tracer.startSpan("get-members");
      span.setAttribute("organization-slug", slug);

      const { members, pendingInvites } = await getMembers({ orgSlug: slug });

      span.setAttribute("members-count", members.length);
      span.setAttribute("pending-invites-count", pendingInvites.length);
      span.end();

      return reply.status(200).send({ members, pendingInvites });
    },
  );
};
