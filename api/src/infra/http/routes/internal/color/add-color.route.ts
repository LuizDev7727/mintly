import { trace } from "@opentelemetry/api";
import { addColor } from "@/functions/color/add-color.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const addColorRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/colors",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
          slug: z.string(),
          channelId: z.uuidv7(),
        }),
        body: z.object({
          r: z.number().int().min(0).max(255),
          g: z.number().int().min(0).max(255),
          b: z.number().int().min(0).max(255),
        }),
        response: {
          201: z.object({
            colorId: z.uuidv7(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { channelId } = request.params;
      const { r, g, b } = request.body;

      const span = tracer.startSpan("add-color");
      span.setAttribute("channel.id", channelId);

      const { colorId } = await addColor({ channelId, rgb: { r, g, b } });

      span.end();

      trace.getActiveSpan()?.setAttribute("color.id", colorId);

      return reply.status(201).send({ colorId });
    },
  );
};
