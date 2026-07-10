import "fastify";

import { Session, User } from "better-auth/types";
import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }

  interface FastifyRequest {
    session: Session & {
      activeOrganizationId: string;
    };
    user: User;
  }
}
