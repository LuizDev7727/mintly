import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Globe, KeyRound, MoreHorizontal, Pencil, Trash } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import type { Webhook } from "@/types/webhook"
import { CreateWebhookDialog } from "./create-webhook-dialog"
import { WebhookDeliveriesSheet } from "./webhook-deliveries-sheet"
import { WebhookSigningSecretDialog } from "./webhook-signing-secret-dialog"
import { Link, useParams } from "@tanstack/react-router"

interface WebhookEndpointsSectionProps {
  webhooks: Webhook[]
}

export function WebhookEndpointsSection({
  webhooks,
}: WebhookEndpointsSectionProps) {

  const { slug } = useParams({
    from: "/orgs/$slug"
  })
  const [secretDialogEndpoint, setSecretDialogEndpoint] =
    useState<Webhook | null>(null)
  const [deliveriesEndpoint, setDeliveriesEndpoint] =
    useState<Webhook | null>(null)

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Webhook Endpoints</h3>
        <CreateWebhookDialog />
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
        {webhooks.length === 0 && (
          <p className="py-6 text-center text-xs text-muted-foreground">
            No webhook endpoints created yet.
          </p>
        )}
        {webhooks.map((webhook) => (
          <div key={webhook.id} className="rounded-md border p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex min-w-0 items-center gap-2">
                <Globe className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-mono text-xs">
                  {webhook.url}
                </span>
              </div>
              <div className="flex shrink-0 items-center gap-1">
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
                        setSecretDialogEndpoint(webhook)
                      }}
                    >
                      <KeyRound className="size-3.5" />
                      View signing secret
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/orgs/$slug/webhooks/$webhookId" params={{ slug, webhookId: webhook.id }}>
                        <Pencil className="size-3.5" />
                        Details
                      </Link>
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
              {webhook.triggers.map((trigger) => (
                <Badge key={trigger} variant="outline" className="font-mono text-[10px]">
                  {trigger}
                </Badge>
              ))}
            </div>

            <p className="mt-2 text-xs text-muted-foreground">
              Last delivery:{" "}
              {webhook.lastLog ? (
                <span
                  className={cn(
                    webhook.lastLog.status === "FAILED" && "text-destructive",
                  )}
                >
                  {webhook.lastLog.status === "FAILED"
                    ? "Failed"
                    : webhook.lastLog.status === "PENDING"
                      ? "Pending"
                      : "Success"}{" "}
                  ·{" "}
                  {formatDistanceToNow(new Date(webhook.lastLog.createdAt), {
                    addSuffix: true,
                  })}
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
