import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { deleteColor } from "@/functions/color/delete-color.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const deleteColorRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/api/organizations/:slug/channels/:channelId/colors/:colorId",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.uuidv7(),
          colorId: z.uuidv7(),
        }),
        response: {
          204: z.never(),
        },
      },
    },
    async (request, reply) => {
      const { colorId } = request.params;

      const span = tracer.startSpan("delete-color");
      span.setAttribute("color.id", colorId);

      await deleteColor({ colorId });

      span.end();

      return reply.status(204).send();
    },
  );
};
