import { useMemo, useState } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { WebhookLog } from "@/http/webhook/get-webhook.http"
import { WebhookLogItem } from "./webhook-log-item"

type StatusFilter = "ALL" | "PENDING" | "SUCCESS" | "FAILED"

const STATUS_FILTERS: {
  key: StatusFilter
  label: string
  dotClassName: string
}[] = [
  { key: "ALL", label: "All", dotClassName: "bg-muted-foreground" },
  { key: "PENDING", label: "Pending", dotClassName: "bg-amber-500" },
  { key: "SUCCESS", label: "Success", dotClassName: "bg-primary" },
  { key: "FAILED", label: "Error", dotClassName: "bg-destructive" },
]

interface WebhookLogsSectionProps {
  logs: WebhookLog[]
}

export function WebhookLogsSection({ logs }: WebhookLogsSectionProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL")

  const counts = useMemo(
    () => ({
      ALL: logs.length,
      PENDING: logs.filter((log) => log.status === "PENDING").length,
      SUCCESS: logs.filter((log) => log.status === "SUCCESS").length,
      FAILED: logs.filter((log) => log.status === "FAILED").length,
    }),
    [logs],
  )

  const filteredLogs =
    statusFilter === "ALL"
      ? logs
      : logs.filter((log) => log.status === statusFilter)

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="space-y-3 p-4">
        <div>
          <h2 className="text-sm font-medium">Delivery Logs</h2>
          <p className="text-xs text-muted-foreground">
            {logs.length} {logs.length === 1 ? "delivery" : "deliveries"} recorded for this endpoint.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {STATUS_FILTERS.map((filter) => (
              <button
                key={filter.key}
                type="button"
                aria-pressed={statusFilter === filter.key}
                onClick={() => setStatusFilter(filter.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors",
                  statusFilter === filter.key
                    ? "border-foreground/20 bg-muted text-foreground"
                    : "border-border text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                )}
              >
                <span className={cn("size-1.5 rounded-full", filter.dotClassName)} />
                {filter.label}
                <span className="text-muted-foreground">{counts[filter.key]}</span>
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setStatusFilter("ALL")}
            className="text-muted-foreground"
          >
            <X className="size-3.5" />
            Reset
          </Button>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <p className="border-t py-6 text-center text-xs text-muted-foreground">
          {logs.length === 0
            ? "No deliveries yet. Events will show up here once they're triggered."
            : "No deliveries match this filter."}
        </p>
      ) : (
        <div className="border-t">
          {filteredLogs.map((log) => (
            <WebhookLogItem key={log.id} log={log} />
          ))}
        </div>
      )}
    </div>
  )
}
