import { ResourceNotFoundError } from "@/functions/errors/resource-not-found.error.ts";
import type { FastifyInstance } from "fastify";
import { z, ZodError } from "zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (error instanceof ZodError) {
    reply.status(400).send({
      message: "Validation error",
      errors: z.treeifyError(error),
    });
  }

  if (error instanceof ResourceNotFoundError) {
    reply.status(404).send({
      message: error.message,
    });
  }

  reply.status(500).send({ message: "Internal server error" });
};
