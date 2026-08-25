import { getProjects } from "@/functions/project/get-projects.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkApiKey } from "../../middleware/check-api-key.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getProjectsExternalRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/v1/projects",
    {
      preHandler: [checkApiKey],
      schema: {
        querystring: z.object({
          channelId: z.string(),
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
      const { channelId, titleFilter, pageIndex } = request.query;

      const span = tracer.startSpan("get-projects-external");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("organization.id", request.organization.id);

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
