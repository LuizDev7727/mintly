import { auth } from "@/lib/auth.ts";
import { fromNodeHeaders } from "better-auth/node";
import { FastifyRequest } from "fastify";

export async function checkUserSession(request: FastifyRequest) {
  const headers = fromNodeHeaders(request.headers);
  const sessionData = await auth.api.getSession({
    headers: headers,
  });

  if (!sessionData) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  const { session, user } = sessionData;

  request.session = session;
  request.user = user;
}
