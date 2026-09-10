import { getPaymentMethods } from "@/functions/organization/get-payment-methods.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getPaymentMethodsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/billing/payment-methods",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          pageIndex: z.coerce.number().int().min(0).default(0),
        }),
        response: {
          200: z.object({
            paymentMethods: z.array(
              z.object({
                id: z.string(),
                brand: z.string(),
                last4: z.string(),
                expMonth: z.number(),
                expYear: z.number(),
                isDefault: z.boolean(),
              }),
            ),
            meta: z.object({
              totalCount: z.number(),
              totalPages: z.number(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { pageIndex } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-payment-methods");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("page-index", pageIndex);

      await checkMembership({ organizationSlug: slug, userId });

      const { paymentMethods, meta } = await getPaymentMethods({
        organizationSlug: slug,
        pageIndex,
      });

      span.end();

      return reply.status(200).send({ paymentMethods, meta });
    },
  );
};
