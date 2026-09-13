import { useState } from "react"
import { format } from "date-fns"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { Separator } from "@/components/ui/separator"
import { Link, useParams } from "@tanstack/react-router"
import type { GetWebhookResponse } from "@/http/webhook/get-webhook.http"

interface WebhookDetailsHeaderProps {
  webhook: GetWebhookResponse
}

function maskSecret(secret: string) {
  return `${secret.slice(0, 10)}${"•".repeat(20)}${secret.slice(-4)}`
}

export function WebhookDetailsHeader({ webhook }: WebhookDetailsHeaderProps) {
  const { slug } = useParams({
    from: "/orgs/$slug",
  })

  const [secretVisible, setSecretVisible] = useState(false)

  const successCount = webhook.logs.filter((log) => log.status === "SUCCESS").length
  const failedCount = webhook.logs.filter((log) => log.status === "FAILED").length
  const pendingCount = webhook.logs.filter((log) => log.status === "PENDING").length

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" size="sm" className="-ms-2">
        <Link to="/orgs/$slug/webhooks" params={{ slug }}>
          <ArrowLeft className="size-4" />
          Back to webhooks
        </Link>
      </Button>

      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <p className="truncate font-mono text-sm text-foreground">
              {webhook.url}
            </p>
            <p className="text-xs text-muted-foreground">
              Created {format(new Date(webhook.createdAt), "MMM d, yyyy 'at' HH:mm")}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
            {webhook.logs.length > 0 ? (
              <>
                {successCount > 0 && (
                  <Badge>{successCount} success</Badge>
                )}
                {failedCount > 0 && (
                  <Badge variant="destructive">{failedCount} failed</Badge>
                )}
                {pendingCount > 0 && (
                  <Badge variant="processing">{pendingCount} pending</Badge>
                )}
              </>
            ) : (
              <Badge variant="outline">No deliveries yet</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {webhook.triggers.map((trigger) => (
            <Badge key={trigger} variant="outline" className="font-mono text-[10px]">
              {trigger}
            </Badge>
          ))}
        </div>

        <Separator />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Webhook ID</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
                {webhook.id}
              </code>
              <CopyButton value={webhook.id} />
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Signing secret</p>
            <div className="flex items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-xs">
                {secretVisible ? webhook.signingSecret : maskSecret(webhook.signingSecret)}
              </code>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                onClick={() => setSecretVisible((prev) => !prev)}
                aria-label={secretVisible ? "Hide signing secret" : "Reveal signing secret"}
              >
                {secretVisible ? <EyeOff /> : <Eye />}
              </Button>
              <CopyButton value={webhook.signingSecret} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
