import { addInspirationalThumbnail } from "@/functions/inspirational-thumbnail/add-inspirational-thumbnail.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../../middleware/check-user-session.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { createActivity } from "@/utils/create-activity.ts";
import { checkMembership } from "@/infra/http/middleware/check-membership.ts";

export const addInspirationalThumbnailRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/organizations/:slug/channels/:channelId/inspirational-thumbnails",
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
          name: z.string(),
          type: z.string(),
          size: z.number(),
          key: z.string(),
        }),
        response: {
          201: z.object({
            inspirationalThumbnailId: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { slug, channelId } = request.params;
      const { name, type, size, key } = request.body;
      const { id: userId } = request.user;

      const span = tracer.startSpan("addInspirationalThumbnail");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("file.name", name);

      await checkMembership({ organizationSlug: slug, userId });

      await checkFileExists({ key });

      const { inspirationalThumbnailId } = await addInspirationalThumbnail({
        channelId,
        name,
        type,
        size,
        key,
      });

      await createActivity({
        action: "UPLOAD_INSPIRATIONAL_THUMBNAIL",
        authorId: userId,
        description: `Uploaded inspirational thumbnail ${name}`,
        orgSlug: slug,
      })

      span.end();

      return reply.status(201).send({ inspirationalThumbnailId });
    },
  );
};
