import { addInspirationalThumbnail } from "@/functions/inspirational-thumbnail/add-inspirational-thumbnail.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";
import { checkFileExists } from "@/utils/cloudflare/check-file-exists.ts";
import { createActivity } from "@/utils/create-activity.ts";

export const addInspirationalThumbnailRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/channels/:channelId/inspirational-thumbnails",
    {
      preHandler: [checkUserSession],
      schema: {
        params: z.object({
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
      const { channelId } = request.params;
      const { name, type, size, key } = request.body;

      const span = tracer.startSpan("addInspirationalThumbnail");
      span.setAttribute("channel.id", channelId);
      span.setAttribute("file.name", name);

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
        authorId: request.user.id,
        description: `Uploaded inspirational thumbnail ${name}`,
        orgSlug: request.session.activeOrganizationId,
      })

      span.end();

      return reply.status(201).send({ inspirationalThumbnailId });
    },
  );
};
