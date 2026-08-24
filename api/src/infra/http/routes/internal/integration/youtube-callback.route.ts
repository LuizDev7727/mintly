import { env } from "@/env.ts";
import { connectYoutube } from "@/functions/integration/connect-youtube.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const FRONTEND_URL = env.GOOGLE_REDIRECT_CALLBACK_URI;

export const youtubeCallbackRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/integrations/youtube/callback",
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

      const span = tracer.startSpan("youtube-callback");

      span.setAttribute("channel.id", channelId);

      await connectYoutube({ channelId, code });

      span.end();

      return reply.redirect(
        `${FRONTEND_URL}/orgs/${orgSlug}/channels/${channelId}/integrations`,
      );
    },
  );
};
