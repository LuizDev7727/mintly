import { skipOnboardingInvite } from "@/functions/onboarding/skip-onboarding-invite.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";

export const skipOnboardingInviteRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/me/onboarding/skip-invite",
    {
      preHandler: [checkUserSession],
      schema: {
        response: {
          200: z.object({
            step: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;

      const span = tracer.startSpan("skip-onboarding-invite");

      const { step } = await skipOnboardingInvite({ userId });

      span.end();

      return reply.status(200).send({ step });
    },
  );
};
