import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
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
import { cn } from "@/lib/utils"
import type { RecentDelivery } from "@/http/webhook/get-webhooks-overview.http"
import { WebhookDeliveryDetailsSheet } from "./webhook-delivery-details-sheet"

interface RecentDeliveriesSectionProps {
  deliveries: RecentDelivery[]
}

export function RecentDeliveriesSection({
  deliveries,
}: RecentDeliveriesSectionProps) {
  const [selectedItem, setSelectedItem] = useState<RecentDelivery | null>(null)

  return (
    <div className="space-y-4 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Recent Deliveries</h2>
          <p className="text-xs text-muted-foreground">
            The latest webhook attempts across all of your endpoints.
          </p>
        </div>
        <Button variant="outline" size="sm">
          View all deliveries
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8" />
              <TableHead>Endpoint</TableHead>
              <TableHead>Response</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deliveries.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={4}
                  className="py-6 text-center text-xs text-muted-foreground"
                >
                  No deliveries yet.
                </TableCell>
              </TableRow>
            )}
            {deliveries.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <TableCell>
                  <span
                    className={cn(
                      "block size-2 rounded-full",
                      item.status === "SUCCESS"
                        ? "bg-primary"
                        : item.status === "FAILED"
                          ? "bg-destructive"
                          : "bg-amber-500",
                    )}
                  />
                </TableCell>
                <TableCell className="max-w-64 truncate font-mono text-xs text-muted-foreground">
                  {item.url}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "SUCCESS"
                        ? "default"
                        : item.status === "FAILED"
                          ? "destructive"
                          : "outline"
                    }
                  >
                    {item.statusCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(item.createdAt), {
                    addSuffix: true,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Button variant="ghost" size="sm" className="w-full text-muted-foreground">
        View all deliveries →
      </Button>

      <WebhookDeliveryDetailsSheet
        item={selectedItem}
        onOpenChange={(open) => {
          if (!open) setSelectedItem(null)
        }}
      />
    </div>
  )
}
