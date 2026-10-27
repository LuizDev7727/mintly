import { getChannelOrganizationSlug } from "@/functions/channel/get-channel-organization-slug.ts"
import { publishWebhookEvents } from "./publish-webhook.ts"

type PublishPostPostedWebhookParams = {
  channelId: string
  title: string
  description: string
  tags: string[]
}

// Chamado quando todas as redes publicaram o post (onSuccess de `process-post`).
export async function publishPostPostedWebhook(
  params: PublishPostPostedWebhookParams,
) {
  const { channelId, title, description, tags } = params

  await publishWebhookEvents({
    orgSlug: await getChannelOrganizationSlug({ channelId }),
    trigger: 'post.posted',
    events: [{ title, description, tags }],
  })
}

type PublishPostFailedWebhookParams = {
  channelId: string
  message: string
}

// Chamado quando o processamento ou a publicação do post falha (onFailure de
// `process-post`).
export async function publishPostFailedWebhook(
  params: PublishPostFailedWebhookParams,
) {
  const { channelId, message } = params

  await publishWebhookEvents({
    orgSlug: await getChannelOrganizationSlug({ channelId }),
    trigger: 'post.failed',
    events: [{ message }],
  })
}
