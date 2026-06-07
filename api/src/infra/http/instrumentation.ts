import { NodeSDK } from "@opentelemetry/sdk-node";
import { HttpInstrumentation } from "@opentelemetry/instrumentation-http";
import { PgInstrumentation } from "@opentelemetry/instrumentation-pg";
import { FastifyOtelInstrumentation } from "@fastify/otel";

const sdk = new NodeSDK({
  instrumentations: [
    new HttpInstrumentation(),
    new PgInstrumentation(),
    new FastifyOtelInstrumentation({ registerOnInitialization: true }),
  ],
});

sdk.start();
