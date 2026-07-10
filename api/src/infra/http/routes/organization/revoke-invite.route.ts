import { revokeInvite } from "@/functions/organization/revoke-invite.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const revokeInviteRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/organizations/:slug/invites/:inviteId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          inviteId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { slug, inviteId } = request.params;

      const span = tracer.startSpan("revoke-invite");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("invite-id", inviteId);

      await revokeInvite({ orgSlug: slug, inviteId });

      span.end();

      return reply.status(204).send();
    },
  );
};
