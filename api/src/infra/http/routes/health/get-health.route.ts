import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";

export const getHealthRoute: FastifyPluginAsyncZod = async (app) => {
  app.get(
    "/api/health",
    {
      preHandler: [],
      schema: {
        response: {
          200: z.object({
            status: z.string(),
          }),
        },
      },
    },
    async (_request, reply) => {
      return reply.status(200).send({ status: "ok" });
    },
  );
};
