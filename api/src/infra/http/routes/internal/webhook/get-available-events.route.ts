import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { getAvaiableEvents } from "@/functions/webhook/get-avaiable-events.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getAvailableEventsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/webhooks/available-events",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          200: z.object({
            triggers: z.array(
              z.object({
                trigger: z.string(),
                description: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-available-events");

      await checkMembership({ organizationSlug: slug, userId });

      const { triggers } = await getAvaiableEvents();

      span.setAttribute("triggers-count", triggers.length);
      span.end();

      return reply.status(200).send({ triggers });
    },
  );
};
