import { generateUploadSignedUrls } from "@/utils/cloudflare/generate-upload-signed-urls.ts";
import { tracer } from "@/infra/http/tracer/tracer.ts";
import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { checkUserSession } from "../../middleware/check-user-session.ts";

export const presignUploadRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/api/uploads/presign",
    {
      preHandler: [checkUserSession],
      schema: {
        body: z.object({
          file: z.object({
            name: z.string(),
            type: z.string(),
            size: z.number(),
          }),
          resume: z
            .object({
              key: z.string(),
              uploadId: z.string(),
              partNumbers: z.array(z.number()),
            })
            .optional(),
        }),
        response: {
          200: z.object({
            key: z.string(),
            uploadId: z.string().nullable(),
            parts: z.array(
              z.object({
                partNumber: z.number(),
                url: z.string(),
              }),
            ),
          }),
        },
      },
    },
    async (request, reply) => {
      const { file, resume } = request.body;

      const span = tracer.startSpan("presignUpload");
      span.setAttribute("file.name", file.name);

      const result = await generateUploadSignedUrls({ file, resume });

      span.end();

      return reply.status(200).send(result);
    },
  );
};
