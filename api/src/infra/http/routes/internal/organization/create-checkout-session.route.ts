import { createCheckoutSession } from "@/functions/organization/create-checkout-session.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const createCheckoutSessionRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/organizations/:slug/billing/checkout-session",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        response: {
          201: z.object({
            checkoutUrl: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("create-checkout-session");
      span.setAttribute("organization-slug", slug);

      await checkMembership({ organizationSlug: slug, userId });

      const { checkoutUrl } = await createCheckoutSession({
        organizationSlug: slug,
      });

      span.end();

      return reply.status(201).send({ checkoutUrl });
    },
  );
};
