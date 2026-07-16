import { getProjects } from "@/functions/project/get-projects.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getProjectsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:orgSlug/channels/:channelId/projects",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
        }),
        querystring: z.object({
          titleFilter: z.string().nullable().default(null),
          pageIndex: z.coerce.number().int().min(0).default(0),
        }),
        response: {
          200: z.object({
            projects: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                thumbnailUrl: z.string().nullable(),
                status: z.enum([
                  "SUCCESS",
                  "PROCESSING",
                  "SCHEDULED",
                  "ERROR",
                  "CANCELED",
                ]),
                createdAt: z.date(),
                clipCount: z.number(),
                owner: z.object({
                  name: z.string(),
                  avatarUrl: z.string().nullable(),
                }),
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
      const { channelId } = request.params;
      const { titleFilter, pageIndex } = request.query;

      const span = tracer.startSpan("get-projects");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("title_filter", titleFilter ?? "No title filter");

      const { projects, meta } = await getProjects({
        channelId,
        pageIndex,
        titleFilter,
      });

      span.end();

      return reply.status(200).send({
        projects,
        meta,
      });
    },
  );
};
