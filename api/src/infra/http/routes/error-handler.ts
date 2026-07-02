import { ChannelAlreadyExistsError } from "@/functions/errors/channel-already-exists.error.ts";
import { FolderAlreadyExistsError } from "@/functions/errors/folder-already-exists.error.ts";
import { ResourceNotFoundError } from "@/functions/errors/resource-not-found.error.ts";
import type { FastifyInstance } from "fastify";
import { hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";

type FastifyErrorHandler = FastifyInstance["errorHandler"];

export const errorHandler: FastifyErrorHandler = (error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    return reply.status(400).send({
      message: "Validation error",
      errors: error.validation,
    });
  }

  if (error instanceof ResourceNotFoundError) {
    return reply.status(404).send({
      message: error.message,
    });
  }

  if (error instanceof ChannelAlreadyExistsError) {
    return reply.status(409).send({
      message: error.message,
    });
  }

  if (error instanceof FolderAlreadyExistsError) {
    return reply.status(409).send({
      message: error.message,
    });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
