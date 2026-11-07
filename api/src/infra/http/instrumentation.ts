import { FastifyOtelInstrumentation } from "@fastify/otel";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { NodeSDK } from "@opentelemetry/sdk-node";

const sdk = new NodeSDK({
  instrumentations: [
    new HttpInstrumentation(),
    new PgInstrumentation(),
    new FastifyOtelInstrumentation({ registerOnInitialization: true }),
  ],
});

sdk.start();
