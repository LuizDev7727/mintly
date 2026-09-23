import { UnauthorizedError } from "@/errors/unauthorized.error.ts";
import { auth } from "@/lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyRequest } from "fastify";

export async function checkUserSession(request: FastifyRequest) {
  const headers = fromNodeHeaders(request.headers);
  const sessionData = await auth.api.getSession({
    headers: headers,
  });

  if (!sessionData) {
    throw new UnauthorizedError();
  }

  const { session, user } = sessionData;

  // better-auth types `activeOrganizationId` as optional; it is filled by the
  // session hook in lib/auth.ts, so it is only absent for users with no
  // organization yet. The FastifyRequest augmentation declares it as required.
  request.session = session as typeof request.session;
  request.user = user;
}
