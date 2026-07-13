import { completeMultipartUpload } from "@/utils/cloudflare/complete-multipart-upload.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const completeMultipartUploadRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/uploads/complete-multipart",
    {
      preHandler: [checkUserSession],
      schema: {
        body: z.object({
          key: z.string(),
          uploadId: z.string(),
          parts: z.array(
            z.object({
              partNumber: z.number(),
              eTag: z.string(),
            }),
          ),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { key, uploadId, parts } = request.body;

      const span = tracer.startSpan("completeMultipartUpload");
      span.setAttribute("upload.key", key);
      span.setAttribute("upload.parts-count", parts.length);

      await completeMultipartUpload({ key, uploadId, parts });

      span.end();

      return reply.status(204).send();
    },
  );
};
