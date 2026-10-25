import { WebhookEvent } from "./webhook-event.ts"
import { getOrganizationWebhooksForTrigger } from "./get-organization-webhooks-for-trigger.ts"
import { env } from "@/env.ts"
import { qstash } from "@/lib/qstash.ts"
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts"
import { WebhookPublishError } from "@/errors/webhook-publish.error.ts"

export type PublishWebhookEventsParams = Parameters<typeof publishWebhookEvents>

export async function publishWebhookEvents<T extends WebhookEvent['trigger']>({
  orgSlug,
  trigger,
  events,
}: {
  orgSlug: string
  trigger: T
  events: Array<Extract<WebhookEvent, { trigger: T }>['payload']>
}) {
  const organizationWebhooksForTrigger = await getOrganizationWebhooksForTrigger({
    orgSlug,
    trigger,
  })

  if (organizationWebhooksForTrigger.length === 0) {
    return
  }

  if (env.NODE_ENV === 'development') {
    console.log(
      '---------------------------------',
      '\n',
      `[Skipped] [Webhook] Event: "${trigger}":`,
      '\n',
      JSON.stringify(events, null, 2),
      '\n',
      '---------------------------------',
    )
    return
  }

  const topic = await getInfisicalSecret({ secretName: "QSTASH_TOPIC_URL" })

  // Uma lista plana de envios. O `allSettled` espera todos terminarem, mesmo
  // quando algum falha, e nunca rejeita: assim nenhuma rejeição fica solta e
  // os envios que deram certo não são interrompidos pelos que falharam.
  const results = await Promise.allSettled(
    organizationWebhooksForTrigger.flatMap((webhook) =>
      events.map((payload) =>
        qstash.publishJSON({
          topic,
          contentBasedDeduplication: true,
          body: {
            deliverTo: webhook.url,
            webhookId: webhook.id,
            trigger,
            payload,
          },
        }),
      ),
    ),
  )

  const failures = results.filter(
    (result): result is PromiseRejectedResult => result.status === "rejected",
  )

  if (failures.length > 0) {
    throw new WebhookPublishError(failures.length, results.length, failures[0].reason)
  }
}
