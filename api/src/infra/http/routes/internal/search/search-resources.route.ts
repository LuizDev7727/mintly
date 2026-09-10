import { searchResources } from "@/functions/search/search-resources.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const searchResourcesRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/search",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        querystring: z.object({
          query: z.string().min(1),
        }),
        response: {
          200: z.object({
            posts: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                channelId: z.string(),
              }),
            ),
            projects: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                channelId: z.string(),
              }),
            ),
            folders: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                channelId: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { query } = request.query;
      const { id: userId } = request.user;

      const span = tracer.startSpan("searchResources");
      span.setAttribute("organization.slug", slug);
      span.setAttribute("search.query", query);

      await checkMembership({
        organizationSlug: slug,
        userId,
      });

      const { posts, projects, folders } = await searchResources({
        organizationSlug: slug,
        query,
      });

      span.end();

      return reply.status(200).send({ posts, projects, folders });
    },
  );
};
