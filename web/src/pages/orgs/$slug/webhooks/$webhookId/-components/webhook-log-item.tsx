import { ChevronDown } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/ui/code-block"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import type { WebhookLog } from "@/http/webhook/get-webhook.http"
import { DetailRows } from "./detail-rows"

const STATUS_BADGE_VARIANT = {
  SUCCESS: "default",
  FAILED: "destructive",
  PENDING: "processing",
} as const

interface WebhookLogItemProps {
  log: WebhookLog
}

export function WebhookLogItem({ log }: WebhookLogItemProps) {
  const overviewRows = [
    { key: "Content-Type", value: log.contentType ?? "—" },
    {
      key: "Content-Length",
      value: log.contentLength !== null ? `${log.contentLength} bytes` : "—",
    },
    { key: "IP", value: log.ip },
    { key: "Retries", value: String(log.numberOfRetries) },
  ]

  const headerRows = Object.entries(log.headers).map(([key, value]) => ({
    key,
    value,
  }))

  const queryParamRows = log.queryParams
    ? Object.entries(log.queryParams).map(([key, value]) => ({ key, value }))
    : []

  const hasHeaders = headerRows.length > 0
  const hasQueryParams = queryParamRows.length > 0
  const hasBody = !!log.body

  return (
    <Collapsible className="group/row border-b border-l-2 border-l-transparent last:border-b-0 data-[state=open]:border-l-primary data-[state=open]:bg-muted/30">
      <CollapsibleTrigger className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50">
        <Badge
          variant={STATUS_BADGE_VARIANT[log.status]}
          className="w-10 shrink-0 justify-center font-mono"
        >
          {log.status === "PENDING" ? "—" : log.statusCode}
        </Badge>

        <span className="w-12 shrink-0 font-mono text-xs font-semibold uppercase text-muted-foreground">
          {log.method}
        </span>

        <span className="min-w-0 flex-1 truncate font-mono text-xs text-muted-foreground">
          {log.pathname || "/"}
        </span>

        {log.numberOfRetries > 0 && (
          <span className="shrink-0 text-xs text-muted-foreground">
            {log.numberOfRetries} retries
          </span>
        )}

        <span className="shrink-0 text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </span>

        <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/row:rotate-180" />
      </CollapsibleTrigger>

      <CollapsibleContent>
        <div className="space-y-4 border-t bg-background/50 p-4">
          {log.errorReason && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {log.errorReason}
            </p>
          )}

          <DetailRows data={overviewRows} />

          <div className="space-y-2">
            <h4 className="text-xs font-medium">Headers</h4>
            {hasHeaders ? (
              <DetailRows data={headerRows} />
            ) : (
              <p className="text-xs text-muted-foreground">
                No headers recorded for this delivery.
              </p>
            )}
          </div>

          {hasQueryParams && (
            <div className="space-y-2">
              <h4 className="text-xs font-medium">Query Parameters</h4>
              <DetailRows data={queryParamRows} />
            </div>
          )}

          {hasBody && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-medium">Body</h4>
                <CopyButton value={log.body!} />
              </div>
              <CodeBlock code={log.body!} language="json" />
            </div>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
