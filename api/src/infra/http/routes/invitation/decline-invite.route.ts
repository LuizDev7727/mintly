import { declineInvite } from "@/functions/invitation/decline-invite.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const declineInviteRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/invitations/:inviteId/decline",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          inviteId: z.string(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { inviteId } = request.params;
      const { email } = request.user;

      const span = tracer.startSpan("decline-invite");
      span.setAttribute("invite-id", inviteId);

      await declineInvite({ inviteId, email });

      span.end();

      return reply.status(204).send();
    },
  );
};
