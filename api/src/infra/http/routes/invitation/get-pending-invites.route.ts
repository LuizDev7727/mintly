import { getPendingInvites } from "@/functions/invitation/get-pending-invites.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getPendingInvitesRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/invitations/pending",
    {
      preHandler: [checkUserSession],
      schema: {
        response: {
          200: z.object({
            invites: z.array(
              z.object({
                id: z.string(),
                role: z.string().nullable(),
                createdAt: z.date(),
                organization: z.object({
                  id: z.string(),
                  name: z.string(),
                  slug: z.string(),
                  logo: z.string().nullable(),
                }),
                author: z.object({
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { email } = request.user;

      const span = tracer.startSpan("get-pending-invites");
      span.setAttribute("user-email", email);

      const { invites } = await getPendingInvites({ email });

      span.setAttribute("invites-count", invites.length);
      span.end();

      return reply.status(200).send({ invites });
    },
  );
};
