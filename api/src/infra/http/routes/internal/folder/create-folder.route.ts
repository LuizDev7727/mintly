import { trace } from "@opentelemetry/api";
import { createFolder } from "@/functions/folder/create-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const createFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/folders",
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
          title: z.string().min(1),
          parentId: z.uuidv7().nullable(),
        }),
        response: {
          201: z.object({
            folderId: z.uuidv7(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { title, parentId } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("create-folder");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("channel.parent-id", parentId ?? "No parent selected");

      await checkMembership({
        organizationSlug: slug,
        userId
      })

      const { folderId } = await createFolder({ title, channelId, parentId });

      span.end();

      trace.getActiveSpan()?.setAttribute("folder.id", folderId);

      return reply.status(201).send({ folderId });
    },
  );
};
