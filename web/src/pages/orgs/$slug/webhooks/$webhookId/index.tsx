import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from "@tanstack/react-query"
import { getWebhookHttp } from "@/http/webhook/get-webhook.http"
import { WebhookDeliveriesChart } from "./-components/webhook-deliveries-chart"
import { WebhookDeliveriesTable } from "./-components/webhook-deliveries-table"
import { WebhookDetailsHeader } from "./-components/webhook-details-header"
import { WebhookDetailsLoading } from "./-components/webhook-details-loading"
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
      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <WebhookDeliveriesChart logs={data.logs} />
        <WebhookDeliveriesTable logs={data.logs} />
      </div>
    </div>
  )
}
