import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from "@tanstack/react-query"
import { getWebhookHttp } from "@/http/webhook/get-webhook.http"
import { WebhookDetailsHeader } from "./-components/webhook-details-header"
import { WebhookDetailsLoading } from "./-components/webhook-details-loading"
import { WebhookLogsSection } from "./-components/webhook-logs-section"
import { WebhookNotFound } from "./-components/webhook-not-found"

export const Route = createFileRoute('/orgs/$slug/webhooks/$webhookId/')({
  head: () => ({
    meta: [
      { title: "Webhook Details | Mintly" },
      { name: "description", content: "webhook logs." },
    ],
  }),
  component: WebhookDetailsPage,
})

function WebhookDetailsPage() {

  const { slug, webhookId } = Route.useParams()

  const { data, isPending, isError } = useQuery({
    queryKey: ["webhook", webhookId, slug],
    queryFn: () => getWebhookHttp({
      orgSlug: slug,
      webhookId
    }),
  })

  if (isPending) {
    return <WebhookDetailsLoading />
  }

  if (isError || !data) {
    return <WebhookNotFound />
  }

  return (
    <div className="space-y-6">
      <WebhookDetailsHeader webhook={data} />
      <WebhookLogsSection logs={data.logs} />
    </div>
  )
}
