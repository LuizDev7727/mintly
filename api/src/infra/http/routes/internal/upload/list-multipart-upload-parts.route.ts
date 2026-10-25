import { listMultipartUploadParts } from "@/utils/cloudflare/list-multipart-upload-parts.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { assertKeyOwnedByUser } from "@/utils/cloudflare/assert-key-owned-by-user.ts";
import { checkUserSession } from "../../../middleware/check-user-session.ts";

export const listMultipartUploadPartsRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.get(
    "/api/uploads/list-parts",
    {
      preHandler: [checkUserSession],
      schema: {
        querystring: z.object({
          key: z.string(),
          uploadId: z.string(),
        }),
        response: {
          200: z.object({
            parts: z.array(
              z.object({
                partNumber: z.number(),
                eTag: z.string(),
                size: z.number(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { key, uploadId } = request.query;
      const { id: userId } = request.user;

      assertKeyOwnedByUser({ key, userId });

      const span = tracer.startSpan("listMultipartUploadParts");
      span.setAttribute("upload.key", key);

      const result = await listMultipartUploadParts({ key, uploadId });

      span.end();

      return reply.status(200).send(result);
    },
  );
};
