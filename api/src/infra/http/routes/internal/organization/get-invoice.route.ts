import { getInvoice } from "@/functions/organization/get-invoice.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getInvoiceRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/billing/invoices/:invoiceId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          invoiceId: z.string(),
        }),
        response: {
          200: z.object({
            invoice: z.object({
              id: z.string(),
              status: z.string(),
              currency: z.string(),
              createdAt: z.date(),
              updatedAt: z.date(),
              dueAt: z.date(),
              orderId: z.string(),
              customerId: z.string(),
              billingReason: z.string(),
              subscriptionId: z.string(),
              productId: z.string(),
              billing: z.object({
                companyName: z.string(),
                taxId: z.string(),
                address: z.array(z.string()),
              }),
              amounts: z.object({
                subtotal: z.number(),
                discount: z.number(),
                net: z.number(),
                tax: z.number(),
                total: z.number(),
                appliedBalance: z.number(),
                due: z.number(),
                refunded: z.number(),
              }),
              items: z.array(
                z.object({
                  description: z.string(),
                  detail: z.string(),
                  quantity: z.number(),
                  unitPrice: z.number(),
                  total: z.number(),
                }),
              ),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, invoiceId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-invoice");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("invoice-id", invoiceId);

      await checkMembership({ organizationSlug: slug, userId });

      const { invoice } = await getInvoice({
        organizationSlug: slug,
        invoiceId,
      });

      span.end();

      return reply.status(200).send({ invoice });
    },
  );
};
