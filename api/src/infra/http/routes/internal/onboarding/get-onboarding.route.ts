import { getOnboarding } from "@/functions/onboarding/get-onboarding.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";

export const getOnboardingRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/me/onboarding",
    {
      preHandler: [checkUserSession],
      schema: {
        response: {
          200: z.object({
            step: z.number(),
            total: z.number(),
            completed: z.boolean(),
            organizationSlug: z.string().nullable(),
            channelId: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-onboarding");

      const onboarding = await getOnboarding({ userId });

      span.end();

      return reply.status(200).send(onboarding);
    },
  );
};
