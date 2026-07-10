import { acceptInvite } from "@/functions/invitation/accept-invite.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const acceptInviteRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/invitations/:inviteId/accept",
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
      const { id: userId, email } = request.user;

      const span = tracer.startSpan("accept-invite");
      span.setAttribute("invite-id", inviteId);

      await acceptInvite({ inviteId, userId, email });

      span.end();

      return reply.status(204).send();
    },
  );
};
