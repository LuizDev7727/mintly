import { getProject } from "@/functions/project/get-project.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { tracer } from "../../tracer/tracer.ts";

export const getProjectRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/projects/:projectId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          projectId: z.string(),
        }),
        response: {
          200: z.object({
            title: z.string(),
            bestMomentsCount: z.number(),
            owner: z.object({
              name: z.string(),
            }),
          }),
        },
      },
    },
    async (request, reply) => {
      const { projectId } = request.params;

      const span = tracer.startSpan("get-project");
      span.setAttribute("project.id", projectId);

      const project = await getProject({ projectId });

      span.end();

      return reply.status(200).send(project);
    },
  );
};
