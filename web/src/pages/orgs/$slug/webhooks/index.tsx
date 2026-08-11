import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/orgs/$slug/webhooks/')({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Webhooks for your organization",
      },
      { title: "API & Webhooks | Mintly" },
    ],
  }),
  component: WebhooksPage,
})

function WebhooksPage() {
  return <div>API & Webhooks Page</div>
}
