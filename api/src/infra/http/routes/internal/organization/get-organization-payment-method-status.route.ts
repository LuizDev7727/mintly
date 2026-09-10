import { hasOrganizationPaymentMethod } from "@/utils/has-organization-payment-method.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getOrganizationPaymentMethodStatusRoute: FastifyPluginAsyncZod =
  async (app) => {
    app.get(
      "/api/organizations/:slug/billing/payment-method",
      {
        preHandler: [checkUserSession],
        schema: {
          params: z.object({
            slug: z.string(),
          }),
          response: {
            200: z.object({
              hasOrganizationPaymentMethod: z.boolean(),
            }),
          },
        },
      },
      async (request, reply) => {
        const { slug } = request.params;
        const { id: userId } = request.user;

        const span = tracer.startSpan("get-organization-payment-method-status");
        span.setAttribute("organization-slug", slug);

        await checkMembership({ organizationSlug: slug, userId });

        const { hasOrganizationPaymentMethod: hasPaymentMethod } =
          await hasOrganizationPaymentMethod({ organizationSlug: slug });

        span.end();

        return reply
          .status(200)
          .send({ hasOrganizationPaymentMethod: hasPaymentMethod });
      },
    );
  };
