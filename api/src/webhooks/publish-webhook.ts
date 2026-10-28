import { WebhookEvent } from "./webhook-event.ts"
import { getOrganizationWebhooksForTrigger } from "./get-organization-webhooks-for-trigger.ts"
import { env } from "@/env.ts"
import { qstash, qstashTopicUrl } from "@/lib/qstash.ts"

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

  // Uma lista plana de envios. O `allSettled` espera todos terminarem, mesmo
  // quando algum falha, e nunca rejeita: assim nenhuma rejeição fica solta e
  // os envios que deram certo não são interrompidos pelos que falharam.
  const results = await Promise.allSettled(
    organizationWebhooksForTrigger.flatMap((webhook) =>
      events.map((payload) =>
        qstash.publishJSON({
          topic: qstashTopicUrl,
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

  // Quem chama já criou o post ou o projeto. Um erro aqui faria a requisição
  // responder 5xx com o recurso criado, e o cliente, ao tentar de novo, o
  // duplicaria. A falha só é registrada.
  if (failures.length > 0) {
    console.error(
      `[Webhook] Failed to publish ${failures.length} of ${results.length} "${trigger}" event(s) of "${orgSlug}"`,
      failures[0].reason,
    )
  }
}
