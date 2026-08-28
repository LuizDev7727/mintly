import { trace } from "@opentelemetry/api";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { tracer } from "../../../tracer/tracer.ts";
import { createChannel } from "@/functions/channel/create-channel.ts";
import { createActivity } from "@/utils/create-activity.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const createChannelRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/organizations/:slug/channels",
    {
      preHandler: [
        checkUserSession,
      ],
      schema: {
        params: z.object({
          slug: z.string(),
        }),
        body: z.object({
          name: z.string().min(1),
        }),
        response: {
          201: z.object({
            channelId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug } = request.params;
      const { name } = request.body;
      const { id } = request.user;
      const { activeOrganizationId } = request.session;

      await checkMembership({
        organizationSlug: slug,
        userId: id,
      });

      const span = tracer.startSpan("create-channel");
      span.setAttribute("org.slug", slug);

      const { channelId } = await createChannel({ orgSlug: slug, name });

      await createActivity({
        action: "CREATED_CHANNEL",
        authorId: id,
        description: `Created channel ${name}`,
        orgSlug: activeOrganizationId
      })

      span.end();

      trace.getActiveSpan()?.setAttribute("channel.id", channelId);

      return reply.status(201).send({ channelId });
    },
  );
};
