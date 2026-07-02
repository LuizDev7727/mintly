import { trace } from "@opentelemetry/api";
import { createFolder } from "@/functions/folder/create-folder.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const createFolderRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:orgSlug/channels/:channelId/folders",
    {
      preHandler: [],
      schema: {
        params: z.object({
          orgSlug: z.string(),
          channelId: z.string(),
        }),
        body: z.object({
          title: z.string().min(1),
          parentId: z.string().nullable(),
        }),
        response: {
          201: z.object({
            folderId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { title, parentId } = request.body;

      const span = tracer.startSpan("create-folder");
      span.setAttribute("channel.id", channelId);

      const { folderId } = await createFolder({ title, channelId, parentId });

      span.end();

      trace.getActiveSpan()?.setAttribute("folder.id", folderId);

      return reply.status(201).send({ folderId });
    },
  );
};
