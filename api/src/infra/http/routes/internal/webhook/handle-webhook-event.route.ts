import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { z } from "zod";
import { Receiver } from "@upstash/qstash";
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts";
import { handleWebhookEvent } from "@/webhooks/handle-webhook-event.ts";
import { webhookEventSchema } from "@/webhooks/webhook-event.ts";
import { tracer } from "../../../tracer/tracer.ts";

const receiver = new Receiver({
  currentSigningKey: await getInfisicalSecret({ secretName: "QSTASH_CURRENT_SIGNING_KEY" }),
  nextSigningKey: await getInfisicalSecret({ secretName: "QSTASH_NEXT_SIGNING_KEY" }),
});

export const handleWebhookEventRoute: FastifyPluginAsyncZod = async (app) => {
  // Signature verification needs the exact raw bytes QStash signed, so this
  // route keeps the body as a string instead of letting Fastify's default
  // JSON parser touch it — re-serializing a parsed object can produce a
  // different byte sequence and break verification.
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_request, body, done) => done(null, body),
  );

  app.post(
    "/api/webhooks/callback",
    {
      preHandler: [],
      schema: {
        response: {
          200: z.object({ received: z.boolean() }),
          401: z.object({ received: z.boolean() }),
          400: z.object({ received: z.boolean() }),
          502: z.object({ received: z.boolean() }),
        },
      },
    },
    async (request, reply) => {
      const span = tracer.startSpan("handleWebhookEvent");

      const rawBody = request.body as string;
      const signature = request.headers["upstash-signature"];

      if (typeof signature !== "string") {
        span.setAttribute("rejected-reason", "missing-signature");
        span.end();
        return reply.status(401).send({ received: false });
      }

      let isValid = false;

      try {
        isValid = await receiver.verify({ body: rawBody, signature });
      } catch {
        isValid = false;
      }

      if (!isValid) {
        span.setAttribute("rejected-reason", "invalid-signature");
        span.end();
        return reply.status(401).send({ received: false });
      }

      const numberOfRetries = Number(request.headers["upstash-retried"] ?? 0);

      let rawEvent: unknown;

      try {
        rawEvent = JSON.parse(rawBody);
      } catch {
        span.setAttribute("rejected-reason", "invalid-json");
        span.end();
        return reply.status(400).send({ received: false });
      }

      const parsedEvent = webhookEventSchema.safeParse({
        ...(rawEvent as Record<string, unknown>),
        numberOfRetries,
      });

      if (!parsedEvent.success) {
        span.setAttribute("rejected-reason", "invalid-payload");
        span.end();
        return reply.status(400).send({ received: false });
      }

      span.setAttribute("trigger", parsedEvent.data.trigger);
      span.setAttribute("webhook-id", parsedEvent.data.webhookId);
      span.setAttribute("number-of-retries", numberOfRetries);

      const { success } = await handleWebhookEvent(parsedEvent.data);

      span.setAttribute("delivery-success", success);
      span.end();

      if (!success) {
        // A non-2xx makes QStash retry this callback on its own backoff
        // schedule, which re-runs handleWebhookEvent and retries delivery
        // to the customer's endpoint — no separate retry queue needed.
        return reply.status(502).send({ received: false });
      }

      return reply.status(200).send({ received: true });
    },
  );
};
