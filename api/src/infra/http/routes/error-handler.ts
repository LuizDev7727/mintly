import { ChannelAlreadyExistsError } from "@/errors/channel-already-exists.error.ts";
import { FolderAlreadyExistsError } from "@/errors/folder-already-exists.error.ts";
import { OrganizationAlreadyCreatedError } from "@/errors/organization-already-created.ts";
import { ResourceNotFoundError } from "@/errors/resource-not-found.error.ts";
import { UserNotBelongsToTheOrganizationError } from "@/errors/user-not-belongs-to-the-organization.ts";
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

  if (error instanceof UserNotBelongsToTheOrganizationError) {
    return reply.status(403).send({
      message: error.message,
    });
  }

  if (error instanceof OrganizationAlreadyCreatedError) {
    return reply.status(409).send({
      message: error.message,
    });
  }

  return reply.status(500).send({ message: "Internal server error" });
};
