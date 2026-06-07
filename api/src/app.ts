import "./infra/http/instrumentation.ts";

import fastify from "fastify";
import {
  validatorCompiler,
  serializerCompiler,
  type ZodTypeProvider,
  jsonSchemaTransform,
} from "fastify-type-provider-zod";

import { fastifySwagger } from "@fastify/swagger";
import { fastifyCors } from "@fastify/cors";
import fastifyCookie from "@fastify/cookie";
import scalarAPIReference from "@scalar/fastify-api-reference";
import { env } from "./env.ts";
import { errorHandler } from "./infra/http/routes/error-handler.ts";
import { getHealthRoute } from "./infra/http/routes/health/get-health.route.ts";
import { authRoute } from "./infra/http/routes/auth/auth.route.ts";

export const server = fastify({
  logger: {
    transport: {
      target: "pino-pretty",
      options: {
        translateTime: "HH:MM:ss Z",
        ignore: "pid,hostname",
      },
    },
  },
}).withTypeProvider<ZodTypeProvider>();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);
server.setErrorHandler(errorHandler);

if (env.NODE_ENV === "development") {
  server.register(fastifySwagger, {
    openapi: {
      info: {
        title: "Mintly API",
        version: "1.0.0",
      },
    },
    transform: jsonSchemaTransform,
  });

  server.register(scalarAPIReference, {
    routePrefix: "/api/docs",
  });
}

server.register(fastifyCookie);

server.register(fastifyCors, {
  origin: env.ALLOWED_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  credentials: true,
});

server.register(getHealthRoute);
server.register(authRoute);
