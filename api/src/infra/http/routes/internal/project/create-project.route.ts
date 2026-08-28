import { createProject } from "@/functions/project/create-project.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { createActivity } from "@/utils/create-activity.ts";
import { trace } from "@opentelemetry/api";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const createProjectRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/projects",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
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
      const { slug, channelId } = request.params;
      const { file } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("createProject");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("file.name", file.name);

      await checkMembership({ organizationSlug: slug, userId });

      const { projectId } = await createProject({
        channelId,
        ownerId: userId,
        file,
      });

      await createActivity({
        action: "CREATED_PROJECT",
        authorId: userId,
        description: `Created project ${file.name}`,
        orgSlug: slug,
      });

      span.end();
      trace.getActiveSpan()?.setAttribute("project.id", projectId);

      return reply.status(201).send({ projectId });
    },
  );
};
