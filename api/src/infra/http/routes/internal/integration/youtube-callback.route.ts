import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { connectYoutube } from "@/functions/integration/connect-youtube.ts";
import { ONBOARDING_OAUTH_SOURCE } from "@/functions/integration/youtube-oauth-state.ts";
import { advanceOnboarding } from "@/functions/onboarding/advance-onboarding.ts";
import { getChannelOwnerId } from "@/functions/onboarding/get-channel-owner-id.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

const FRONTEND_URL = await getInfisicalSecret({ secretName: "GOOGLE_REDIRECT_CALLBACK_URI" });

const CLOSE_TAB_PAGE = `<!doctype html>
<html><head><meta charset="utf-8"><title>Mintly</title></head>
<body><p>You can close this tab.</p><script>window.close();</script></body></html>`;

export const youtubeCallbackRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/integrations/youtube/callback",
    {
      preHandler: [],
      schema: {
        querystring: z.object({
          code: z.string().optional(),
          error: z.string().optional(),
          state: z.string(),
        }),
      },
    },
    async (request, reply) => {
      const { code, error, state } = request.query;

      const [orgSlug, channelId, source] = state.split(",");

      const isOnboarding = source === ONBOARDING_OAUTH_SOURCE;

      // The user denied access (or Google failed): nothing was connected. In the
      // onboarding tab we just close it; the onboarding screen sees no integration.
      if (!code) {
        if (isOnboarding) {
          return reply.type("text/html").send(CLOSE_TAB_PAGE);
        }

        return reply.redirect(
          `${FRONTEND_URL}/orgs/${orgSlug}/channels/${channelId}/integrations${error ? "?error=" + encodeURIComponent(error) : ""}`,
        );
      }

      const span = tracer.startSpan("youtube-callback");

      span.setAttribute("channel.id", channelId);

      try {
        await connectYoutube({ channelId, code });
      } catch (connectError) {
        span.end();

        // In the onboarding tab, close it anyway: the screen sees no integration.
        if (isOnboarding) {
          request.log.error(connectError);
          return reply.type("text/html").send(CLOSE_TAB_PAGE);
        }

        throw connectError;
      }

      const { ownerId } = await getChannelOwnerId({ channelId });

      if (ownerId) {
        await advanceOnboarding({ userId: ownerId });
      }

      span.end();

      if (isOnboarding) {
        return reply.type("text/html").send(CLOSE_TAB_PAGE);
      }

      return reply.redirect(
        `${FRONTEND_URL}/orgs/${orgSlug}/channels/${channelId}/integrations`,
      );
    },
  );
};
