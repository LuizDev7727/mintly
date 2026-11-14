import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { FastifyOtelInstrumentation } from "@fastify/otel";
import { RedisInstrumentation } from "@opentelemetry/instrumentation-redis";

const sdk = new NodeSDK({
  serviceName: "mintly",
  instrumentations: [
    new HttpInstrumentation(),
    new PgInstrumentation(),
    new RedisInstrumentation(),
    new FastifyOtelInstrumentation({ registerOnInitialization: true }),
  ],
});

sdk.start();
