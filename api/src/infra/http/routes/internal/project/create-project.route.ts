import { createProject } from "@/functions/project/create-project.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { createActivity } from "@/utils/create-activity.ts";
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
          files: z
            .array(
              z.object({
                name: z.string(),
                key: z.string(),
              }),
            )
            .min(1),
        }),
        response: {
          201: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { files } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("createProject");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("files.count", files.length);

      await checkMembership({ organizationSlug: slug, userId });

      await createProject({
        channelId,
        ownerId: userId,
        files,
      });

      await createActivity({
        action: "CREATED_PROJECT",
        authorId: userId,
        description:
          files.length === 1
            ? `Created project ${files[0].name}`
            : `Created ${files.length} projects`,
        orgSlug: slug,
      });

      span.end();

      return reply.status(201).send();
    },
  );
};
