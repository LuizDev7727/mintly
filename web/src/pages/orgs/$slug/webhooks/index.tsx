import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from "@tanstack/react-query"
import { getWebhooksOverviewHttp } from "@/http/webhook/get-webhooks-overview.http"
import { ApiKeySection } from "./-components/api-key-section"
import { QuickReferenceSection } from "./-components/quick-reference-section"
import { RecentDeliveriesSection } from "./-components/recent-deliveries-section"
import { WebhookEndpointsSection } from "./-components/webhook-endpoints-section"
import { WebhookStatsSection } from "./-components/webhook-stats-section"
import { WebhooksOverviewLoading } from "./-components/webhooks-overview-loading"

export const Route = createFileRoute('/orgs/$slug/webhooks/')({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "API keys and webhooks for your organization",
      },
      { title: "API & Webhooks | Mintly" },
    ],
  }),
  component: WebhooksPage,
})

function WebhooksPage() {
  const { slug } = Route.useParams()

  const { data, isPending } = useQuery({
    queryKey: ["webhooks-overview", slug],
    queryFn: () => getWebhooksOverviewHttp({ orgSlug: slug }),
  })

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-3">
          <div>
            <h1 className="text-xl font-semibold">API & Webhooks</h1>
            <p className="text-sm text-muted-foreground">
              Manage your API key and configure webhook endpoints to
              integrate Mintly with external services.
            </p>
          </div>
        </div>

      </div>

      {isPending || !data ? (
        <WebhooksOverviewLoading />
      ) : (
        <>
          <WebhookStatsSection metrics={data.metrics} />

          <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <RecentDeliveriesSection deliveries={data.recentDeliveries} />
              <QuickReferenceSection />
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h2 className="text-sm font-medium">Configuration</h2>
                <p className="text-xs text-muted-foreground">
                  Manage your API credentials and endpoints.
                </p>
              </div>
              <ApiKeySection apiKey={data.apiKey} />
              <WebhookEndpointsSection webhooks={data.webhooks} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
