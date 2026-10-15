import { useMemo, useState } from "react"
import { format } from "date-fns"
import { ChevronRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import type { WebhookLog } from "@/http/webhook/get-webhook.http"
import { WebhookDeliverySheet } from "./webhook-delivery-sheet"

const PAGE_SIZE = 12

const STATUS_LABEL = {
  SUCCESS: "Success",
  FAILED: "Failed",
  PENDING: "Pending",
} as const

const STATUS_BADGE_VARIANT = {
  SUCCESS: "default",
  FAILED: "destructive",
  PENDING: "processing",
} as const

function formatDuration(log: WebhookLog) {
  if (!log.finishedAt) return "—"

  const duration =
    new Date(log.finishedAt).getTime() - new Date(log.createdAt).getTime()

  return duration >= 1000 ? `${(duration / 1000).toFixed(1)}s` : `${duration}ms`
}

interface WebhookDeliveriesTableProps {
  logs: WebhookLog[]
}

export function WebhookDeliveriesTable({ logs }: WebhookDeliveriesTableProps) {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const sortedLogs = useMemo(
    () => [...logs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [logs],
  )

  const filteredLogs = sortedLogs

  const visibleLogs = filteredLogs.slice(0, visibleCount)
  const hasMore = filteredLogs.length > visibleCount

  const selectedLog = filteredLogs.find((log) => log.id === selectedId) ?? null

  return (
    <div className="overflow-hidden bg-card">

      {filteredLogs.length === 0 ? (
        <p className="border-t py-6 text-center text-xs text-muted-foreground">
          No deliveries yet. Events will show up here once they're triggered.
        </p>
      ) : (
        <div className="relative">
          {/* O fade no final sugere que há mais entregas abaixo. */}
          <div
            data-fade={hasMore}
            className="border-t data-[fade=true]:mask-[linear-gradient(to_bottom,black_70%,transparent)]"
          >
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-4">Time</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead className="text-right">Code</TableHead>
                  <TableHead className="text-right">Duration</TableHead>
                  <TableHead className="text-right">Retries</TableHead>
                  <TableHead className="w-10 pr-4" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {visibleLogs.map((log) => {
                  const createdAt = new Date(log.createdAt)

                  return (
                    <TableRow
                      key={log.id}
                      tabIndex={0}
                      data-status={log.status}
                      data-selected={log.id === selectedId}
                      onClick={() => setSelectedId(log.id)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") setSelectedId(log.id)
                      }}
                      className="group/row cursor-pointer font-mono text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring/50 data-[selected=true]:bg-muted/30 data-[status=FAILED]:bg-destructive/10 data-[status=FAILED]:shadow-[inset_2px_0_0_var(--destructive)] data-[status=FAILED]:hover:bg-destructive/15"
                    >
                      <TableCell className="pl-4">
                        {format(createdAt, "HH:mm:ss")}
                        <span className="text-muted-foreground">
                          {format(createdAt, ".SSS")}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[log.status]}>
                          {STATUS_LABEL[log.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-semibold text-muted-foreground">
                        {log.method}
                      </TableCell>
                      <TableCell className="max-w-64 truncate">
                        {log.pathname || "/"}
                        {log.errorReason && (
                          <span className="ml-2 text-destructive">
                            {log.errorReason}
                          </span>
                        )}
                      </TableCell>
                      <TableCell
                        data-status={log.status}
                        className="text-right data-[status=FAILED]:text-destructive"
                      >
                        {log.status === "PENDING" ? "—" : log.statusCode}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {formatDuration(log)}
                      </TableCell>
                      <TableCell className="text-right text-muted-foreground">
                        {log.numberOfRetries}
                      </TableCell>
                      <TableCell className="pr-4">
                        <ChevronRight
                          aria-hidden="true"
                          className="size-3.5 text-muted-foreground"
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>

          {hasMore && (
            <Button
              type="button"
              size="sm"
              onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
              className="absolute bottom-3 left-1/2 -translate-x-1/2 shadow-lg"
            >
              Show more
              <span className="opacity-70">
                {(filteredLogs.length - visibleCount).toLocaleString("en-US")} remaining
              </span>
            </Button>
          )}
        </div>
      )}

      <WebhookDeliverySheet
        log={selectedLog}
        onOpenChange={(open) => !open && setSelectedId(null)}
      />
    </div>
  )
}
