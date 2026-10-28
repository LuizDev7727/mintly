import type { ReactNode } from "react"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/ui/code-block"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { WebhookLog } from "@/http/webhook/get-webhook.http"

const STATUS_LABEL = {
  SUCCESS: "Success",
  FAILED: "Error",
  PENDING: "Pending",
} as const

const STATUS_BADGE_VARIANT = {
  SUCCESS: "default",
  FAILED: "destructive",
  PENDING: "processing",
} as const

function getDurationMs(log: WebhookLog) {
  if (!log.finishedAt) return null

  return new Date(log.finishedAt).getTime() - new Date(log.createdAt).getTime()
}

function SectionTitle({ children, count }: { children: ReactNode; count?: number }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
      {children}
      {count !== undefined && (
        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] normal-case tracking-normal">
          {count}
        </span>
      )}
    </h3>
  )
}

function KeyValueTable({ rows }: { rows: { key: string; value: ReactNode }[] }) {
  return (
    <div className="divide-y overflow-hidden rounded-md border font-mono text-xs">
      {rows.map((row) => (
        <div key={row.key} className="grid grid-cols-[9rem_1fr]">
          <span className="truncate bg-muted/30 px-3 py-2 text-muted-foreground" title={row.key}>
            {row.key}
          </span>
          <span className="min-w-0 break-all px-3 py-2">{row.value}</span>
        </div>
      ))}
    </div>
  )
}

interface WebhookDeliverySheetProps {
  log: WebhookLog | null
  onOpenChange: (open: boolean) => void
}

export function WebhookDeliverySheet({
  log,
  onOpenChange,
}: WebhookDeliverySheetProps) {
  return (
    <Sheet open={!!log} onOpenChange={onOpenChange}>
      <SheetContent className="gap-0 overflow-y-auto sm:max-w-xl">
        {log && <DeliveryDetails log={log} />}
      </SheetContent>
    </Sheet>
  )
}

function DeliveryDetails({ log }: { log: WebhookLog }) {
  const createdAt = new Date(log.createdAt)
  const duration = getDurationMs(log)
  const isFailed = log.status === "FAILED"

  const headerRows = Object.entries(log.headers).map(([key, value]) => ({ key, value }))
  const queryParamRows = log.queryParams
    ? Object.entries(log.queryParams).map(([key, value]) => ({ key, value }))
    : []

  const fieldRows = [
    { key: "time", value: format(createdAt, "MMM d, HH:mm:ss.SSS") },
    {
      key: "status",
      value: (
        <>
          {log.status === "PENDING" ? "—" : log.statusCode}{" "}
          {isFailed && <span className="text-destructive">// FAILED</span>}
        </>
      ),
    },
    { key: "method", value: log.method },
    { key: "url", value: log.url },
    { key: "content-type", value: log.contentType ?? "—" },
    {
      key: "content-length",
      value: log.contentLength !== null ? `${log.contentLength} bytes` : "—",
    },
    { key: "duration", value: duration !== null ? `${duration}ms` : "—" },
    { key: "retries", value: String(log.numberOfRetries) },
    { key: "delivery id", value: log.id },
  ]

  return (
    <>
      <SheetHeader className="space-y-3 border-b p-4 pr-12">
        <div className="flex items-center gap-3">
          <Badge variant={STATUS_BADGE_VARIANT[log.status]} className="uppercase">
            {STATUS_LABEL[log.status]}
          </Badge>
          <SheetTitle className="sr-only">Delivery details</SheetTitle>
          <SheetDescription className="sr-only">
            Details of this webhook delivery.
          </SheetDescription>

        </div>
      </SheetHeader>

      <div className="space-y-6 p-4">
        <section className="space-y-2">
          <SectionTitle>Message</SectionTitle>
          <div className="rounded-md border bg-muted/30 px-3 py-2.5 font-mono text-sm">
            {log.method} {log.pathname || "/"}{" "}
            {log.status !== "PENDING" && (
              <span data-failed={isFailed} className="data-[failed=true]:text-destructive">
                {log.statusCode}
              </span>
            )}
            {duration !== null && <span className="text-muted-foreground"> {duration}ms</span>}
          </div>
          {log.errorReason && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {log.errorReason}
            </p>
          )}
        </section>

        <section className="space-y-2">
          <SectionTitle>Fields</SectionTitle>
          <KeyValueTable rows={fieldRows} />
        </section>

        <section className="space-y-2">
          <SectionTitle count={headerRows.length}>Headers</SectionTitle>
          {headerRows.length > 0 ? (
            <KeyValueTable rows={headerRows} />
          ) : (
            <p className="text-xs text-muted-foreground">
              No headers recorded for this delivery.
            </p>
          )}
        </section>

        {queryParamRows.length > 0 && (
          <section className="space-y-2">
            <SectionTitle count={queryParamRows.length}>Query parameters</SectionTitle>
            <KeyValueTable rows={queryParamRows} />
          </section>
        )}

        {log.body && (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <SectionTitle>Body</SectionTitle>
              <CopyButton value={log.body} />
            </div>
            <CodeBlock code={log.body} language="json" />
          </section>
        )}
      </div>
    </>
  )
}
