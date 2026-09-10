import { getInvoices } from "@/functions/organization/get-invoices.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getInvoicesRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/billing/invoices",
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
            invoices: z.array(
              z.object({
                id: z.string(),
                createdAt: z.date(),
                totalAmount: z.number(),
                currency: z.string(),
                status: z.string(),
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

      const span = tracer.startSpan("get-invoices");
      span.setAttribute("organization-slug", slug);
      span.setAttribute("page-index", pageIndex);

      await checkMembership({ organizationSlug: slug, userId });

      const { invoices, meta } = await getInvoices({
        organizationSlug: slug,
        pageIndex,
      });

      span.end();

      return reply.status(200).send({ invoices, meta });
    },
  );
};
