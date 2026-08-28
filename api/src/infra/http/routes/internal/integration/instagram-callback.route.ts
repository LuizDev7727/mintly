import { env } from "@/env.ts";
import { connectInstagram } from "@/functions/integration/connect-instagram.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const FRONTEND_URL = env.INSTAGRAM_REDIRECT_CALLBACK_URI;

export const instagramCallbackRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/integrations/instagram/callback",
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

      const span = tracer.startSpan("instagram-callback");

      span.setAttribute("channel.id", channelId);

      await connectInstagram({ channelId, code });

      span.end();

      return reply.redirect(
        `${FRONTEND_URL}/orgs/${orgSlug}/channels/${channelId}/integrations`,
      );
    },
  );
};
