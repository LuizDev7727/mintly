import { createInviteMember } from "@/functions/organization/create-invite-member.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const createInviteMemberRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/organizations/:slug/invites",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          email: z.email(),
        }),
        response: {
          201: z.object({
            inviteId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { email } = request.body;
      const { id: inviterId } = request.user;

      const span = tracer.startSpan("create-invite-member");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("invite-email", email);

      const { inviteId } = await createInviteMember({
        orgSlug: slug,
        email,
        inviterId,
      });

      span.end();

      return reply.status(201).send({ inviteId });
    },
  );
};
