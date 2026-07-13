import { abortMultipartUpload } from "@/utils/cloudflare/abort-multipart-upload.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const abortMultipartUploadRoute: FastifyPluginAsyncZod = async (
  app,
) => {
  app.post(
    "/api/uploads/abort-multipart",
    {
      preHandler: [checkUserSession],
      schema: {
        body: z.object({
          key: z.string(),
          uploadId: z.string(),
        }),
        response: {
          204: z.void(),
        },
      },
    },
    async (request, reply) => {
      const { key, uploadId } = request.body;

      const span = tracer.startSpan("abortMultipartUpload");
      span.setAttribute("upload.key", key);

      await abortMultipartUpload({ key, uploadId });

      span.end();

      return reply.status(204).send();
    },
  );
};
