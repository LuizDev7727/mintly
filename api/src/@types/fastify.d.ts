import "fastify";

import { Session, User } from "better-auth/types";
import { FastifyReply, FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyRequest {
    session: Session & {
      activeOrganizationId: string;
    };
    user: User;
    organization: {
      id: string;
      slug: string;
      name: string;
      ownerId: string;
    };
  }
}
