import { useState } from "react"
import { Eye, Globe, KeyRound, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { CreateWebhookDialog } from "./create-webhook-dialog"
import { WebhookDeliveriesSheet } from "./webhook-deliveries-sheet"
import { WebhookSigningSecretDialog } from "./webhook-signing-secret-dialog"

type WebhookEndpoint = {
  id: string
  url: string
  events: string[]
  active: boolean
  signingSecret: string
  lastDelivery: { status: "success" | "failed"; timestamp: string } | null
}

const WEBHOOK_ENDPOINTS: WebhookEndpoint[] = [
  {
    id: "1",
    url: "https://api.myapp.com/webhooks/mintly",
    events: ["post.published", "post.failed"],
    active: true,
    signingSecret: "whsec_8gK2pXmZ4vB7hL3nJ6qT1cR9wF5s",
    lastDelivery: { status: "success", timestamp: "5 minutes ago" },
  },
  {
    id: "2",
    url: "https://hooks.zapier.com/hooks/catch/123456/abcdef",
    events: ["project.completed"],
    active: true,
    signingSecret: "whsec_4dN7yQ2wE9tR6uI3oP1aS8fG5hJ0k",
    lastDelivery: { status: "success", timestamp: "1 hour ago" },
  },
  {
    id: "3",
    url: "https://staging.myapp.dev/webhooks",
    events: ["channel.connected", "channel.disconnected"],
    active: false,
    signingSecret: "whsec_1zX5cV8bN2mK9jH6gF3dS0aQ7wE4r",
    lastDelivery: { status: "failed", timestamp: "2 days ago" },
  },
]

export function WebhookEndpointsSection() {
  const [secretDialogEndpoint, setSecretDialogEndpoint] =
    useState<WebhookEndpoint | null>(null)
  const [deliveriesEndpoint, setDeliveriesEndpoint] =
    useState<WebhookEndpoint | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Webhook Endpoints</h3>
        <CreateWebhookDialog />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {WEBHOOK_ENDPOINTS.map((endpoint) => (
          <div key={endpoint.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Globe className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-xs">
                  {endpoint.url}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <Badge variant={endpoint.active ? "default" : "outline"}>
                  {endpoint.active ? "Active" : "Disabled"}
                </Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon-sm">
                      <MoreHorizontal className="size-3.5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        setDeliveriesEndpoint(endpoint)
                      }}
                    >
                      <Eye className="size-3.5" />
                      View deliveries
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onSelect={(event) => {
                        event.preventDefault()
                        setSecretDialogEndpoint(endpoint)
                      }}
                    >
                      <KeyRound className="size-3.5" />
                      View signing secret
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Pencil className="size-3.5" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash className="size-3.5" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="mt-2 flex flex-wrap gap-1">
              {endpoint.events.map((event) => (
                <Badge key={event} variant="outline" className="font-mono text-[10px]">
                  {event}
                </Badge>
              ))}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Last delivery:{" "}
              {endpoint.lastDelivery ? (
                <span
                  className={cn(
                    endpoint.lastDelivery.status === "failed" &&
                      "text-destructive",
                  )}
                >
                  {endpoint.lastDelivery.status === "failed"
                    ? "Failed"
                    : "Success"}{" "}
                  · {endpoint.lastDelivery.timestamp}
                </span>
              ) : (
                "No deliveries yet"
              )}
            </p>
          </div>
        ))}
      </div>

      <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
        View all endpoints →
      </Button>

      <WebhookSigningSecretDialog
        endpointUrl={secretDialogEndpoint?.url ?? null}
        secret={secretDialogEndpoint?.signingSecret ?? null}
        onOpenChange={(open) => {
          if (!open) setSecretDialogEndpoint(null)
        }}
      />

      <WebhookDeliveriesSheet
        endpointUrl={deliveriesEndpoint?.url ?? null}
        onOpenChange={(open) => {
          if (!open) setDeliveriesEndpoint(null)
        }}
      />
    </div>
  )
}
