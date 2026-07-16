import { createProject } from "@/functions/project/create-project.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { createActivity } from "@/utils/create-activity.ts";
import { trace } from "@opentelemetry/api";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const createProjectRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/channels/:channelId/projects",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          channelId: z.string(),
        }),
        body: z.object({
          file: z.object({
            name: z.string(),
            key: z.string(),
          }),
        }),
        response: {
          201: z.object({
            projectId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { file } = request.body;
      const { activeOrganizationId } = request.session;

      const span = tracer.startSpan("createProject");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("file.name", file.name);

      const { projectId } = await createProject({
        channelId,
        ownerId: request.user.id,
        file,
      });

      await createActivity({
        action: "CREATED_PROJECT",
        authorId: request.user.id,
        description: `Created project ${file.name}`,
        orgSlug: activeOrganizationId,
      });

      span.end();
      trace.getActiveSpan()?.setAttribute("project.id", projectId);

      return reply.status(201).send({ projectId });
    },
  );
};
