import { WebhookEvent } from "./webhook-event.ts"
import { getOrganizationWebhooksForTrigger } from "./get-organization-webhooks-for-trigger.ts"
import { env } from "@/env.ts"
import { qstash } from "@/lib/qstash.ts"
import { getInfisicalSecret } from "@/utils/infisical/get-infisical-secret.ts"

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

  await Promise.all(
    organizationWebhooksForTrigger.flatMap(async (webhook) => {
      return events.map(async (payload) => {
        return qstash.publishJSON({
          topic: await getInfisicalSecret({ secretName: "QSTASH_TOPIC_URL" }),
          contentBasedDeduplication: true,
          body: {
            deliverTo: webhook.url,
            webhookId: webhook.id,
            trigger,
            payload,
          },
        })
      })
    }),
  )
}
