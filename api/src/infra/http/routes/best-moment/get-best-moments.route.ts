import { getBestMoments } from "@/functions/best-moment/get-best-moments.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const getBestMomentsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/projects/:projectId/best-moments",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          projectId: z.string(),
        }),
        querystring: z.object({
          cursor: z.string().optional(),
        }),
        response: {
          200: z.object({
            bestMoments: z.array(
              z.object({
                id: z.string(),
                title: z.string(),
                url: z.url(),
                createdAt: z.date(),
              }),
            ),
            nextCursor: z.string().nullable(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { projectId } = request.params;
      const { cursor } = request.query;

      const span = tracer.startSpan("getBestMoments");
      span.setAttribute("project.id", projectId);

      const { bestMoments, nextCursor } = await getBestMoments({
        projectId,
        cursor,
      });

      span.setAttribute("best-moments-count", bestMoments.length);
      span.end();

      return reply.status(200).send({ bestMoments, nextCursor });
    },
  );
};
