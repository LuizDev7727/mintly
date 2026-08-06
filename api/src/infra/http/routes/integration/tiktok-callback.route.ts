import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { tracer } from "../../tracer/tracer.ts";
import { connectTikTok } from "@/functions/integration/connect-tiktok.ts";
import { env } from "@/env.ts";

const FRONTEND_URL = env.TIKTOK_REDIRECT_CALLBACK_URI;

export const tiktokCallbackRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/integrations/tiktok/callback",
    {
      preHandler: [],
      schema: {
        querystring: z.object({
          code: z.string(),
          state: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { code, state } = request.query;

      const [orgSlug, channelId] = state.split(",");

      const span = tracer.startSpan("tiktok-callback");

      span.setAttribute("channel.id", channelId);
      span.setAttribute("tiktok.code", code);

      await connectTikTok({ channelId, code });

      span.end();

      return reply.redirect(
        `${FRONTEND_URL}/orgs/${orgSlug}/channels/${channelId}/integrations`,
      );
    },
  );
};
