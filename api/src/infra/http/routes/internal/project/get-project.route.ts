import { getProject } from "@/functions/project/get-project.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { tracer } from "../../../tracer/tracer.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const getProjectRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/organizations/:slug/channels/:channelId/projects/:projectId",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.string(),
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
      const { slug, projectId } = request.params;
      const { id: userId } = request.user;

      const span = tracer.startSpan("get-project");
      span.setAttribute("project.id", projectId);

      await checkMembership({ organizationSlug: slug, userId });

      const project = await getProject({ projectId });

      span.end();

      return reply.status(200).send(project);
    },
  );
};
