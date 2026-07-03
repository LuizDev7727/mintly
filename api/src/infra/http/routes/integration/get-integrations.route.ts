import { getFolders } from "@/functions/folder/get-folders.ts";
import { getIntegrations } from "@/functions/integration/get-integrations.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getIntegrationsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/channels/:channelId/integrations",
    {
      preHandler: [],
      schema: {
        params: z.object({
          channelId: z.string(),
        }),
        response: {
          200: z.object({
            integrations: z.array(
              z.object({
                id: z.string(),
                name: z.string(),
                avatarUrl: z.string().nullable(),
                provider: z.enum(["YOUTUBE", "TIKTOK"]),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;

      const span = tracer.startSpan("get-integrations");
      span.setAttribute("channel.id", channelId);

      const { integrations } = await getIntegrations({
        channelId,
      });

      span.end();

      return reply.status(200).send({ integrations });
    },
  );
};
