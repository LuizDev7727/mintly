import { useState } from "react"
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
import { WebhookDeliveryDetailsSheet } from "./webhook-delivery-details-sheet"

export type QueueItem = {
  id: string
  method: "POST"
  statusCode: number
  event: string
  targetUrl: string
  timestamp: string
  headers: Record<string, string>
  requestBody: string
}

const RECENT_QUEUE: QueueItem[] = [
  {
    id: "1",
    method: "POST",
    statusCode: 200,
    event: "post.published",
    targetUrl: "https://api.myapp.com/webhooks/mintly",
    timestamp: "2 minutes ago",
    headers: {
      "Content-Type": "application/json",
      "Mintly-Signature": "t=1755193200,v1=8f2a91c6e4d3b7a1f9e6c5d4b3a29817",
      "Mintly-Event": "post.published",
      "User-Agent": "Mintly-Webhooks/1.0",
    },
    requestBody: JSON.stringify(
      {
        id: "evt_7Ka2pXmZ",
        type: "post.published",
        created_at: "2026-08-14T20:28:00Z",
        data: {
          postId: "post_9f8e7d2c",
          channelId: "channel_4c3b2a1d",
          title: "Behind the scenes at Mintly",
          publishedAt: "2026-08-14T20:28:00Z",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "2",
    method: "POST",
    statusCode: 500,
    event: "post.failed",
    targetUrl: "https://staging.myapp.dev/webhooks",
    timestamp: "8 minutes ago",
    headers: {
      "Content-Type": "application/json",
      "Mintly-Signature": "t=1755192720,v1=4dN7yQ2wE9tR6uI3oP1aS8fG5hJ0k",
      "Mintly-Event": "post.failed",
      "User-Agent": "Mintly-Webhooks/1.0",
    },
    requestBody: JSON.stringify(
      {
        id: "evt_3Nq7wE9t",
        type: "post.failed",
        created_at: "2026-08-14T20:22:00Z",
        data: {
          postId: "post_1a2b3c4d",
          channelId: "channel_5e6f7g8h",
          reason: "Instagram API rate limit exceeded",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "3",
    method: "POST",
    statusCode: 200,
    event: "project.completed",
    targetUrl: "https://hooks.zapier.com/hooks/catch/123456/abcdef",
    timestamp: "22 minutes ago",
    headers: {
      "Content-Type": "application/json",
      "Mintly-Signature": "t=1755192000,v1=1zX5cV8bN2mK9jH6gF3dS0aQ7wE4r",
      "Mintly-Event": "project.completed",
      "User-Agent": "Mintly-Webhooks/1.0",
    },
    requestBody: JSON.stringify(
      {
        id: "evt_9pL4mN2k",
        type: "project.completed",
        created_at: "2026-08-14T20:08:00Z",
        data: {
          projectId: "project_2b3c4d5e",
          channelId: "channel_4c3b2a1d",
          clipsGenerated: 6,
        },
      },
      null,
      2,
    ),
  },
  {
    id: "4",
    method: "POST",
    statusCode: 200,
    event: "post.published",
    targetUrl: "https://api.myapp.com/webhooks/mintly",
    timestamp: "1 hour ago",
    headers: {
      "Content-Type": "application/json",
      "Mintly-Signature": "t=1755189600,v1=6uI3oP1aS8fG5hJ0k4dN7yQ2wE9tR",
      "Mintly-Event": "post.published",
      "User-Agent": "Mintly-Webhooks/1.0",
    },
    requestBody: JSON.stringify(
      {
        id: "evt_5wQ8rT1y",
        type: "post.published",
        created_at: "2026-08-14T19:28:00Z",
        data: {
          postId: "post_6f5e4d3c",
          channelId: "channel_4c3b2a1d",
          title: "5 tips to grow your channel",
          publishedAt: "2026-08-14T19:28:00Z",
        },
      },
      null,
      2,
    ),
  },
  {
    id: "5",
    method: "POST",
    statusCode: 200,
    event: "channel.connected",
    targetUrl: "https://api.myapp.com/webhooks/mintly",
    timestamp: "3 hours ago",
    headers: {
      "Content-Type": "application/json",
      "Mintly-Signature": "t=1755182400,v1=2wE9tR6uI3oP1aS8fG5hJ0k4dN7yQ",
      "Mintly-Event": "channel.connected",
      "User-Agent": "Mintly-Webhooks/1.0",
    },
    requestBody: JSON.stringify(
      {
        id: "evt_2rY6tU9i",
        type: "channel.connected",
        created_at: "2026-08-14T17:28:00Z",
        data: {
          channelId: "channel_7h8i9j0k",
          provider: "YOUTUBE",
          channelName: "Mintly Official",
        },
      },
      null,
      2,
    ),
  },
]

export function RecentDeliveriesSection() {
  const [selectedItem, setSelectedItem] = useState<QueueItem | null>(null)

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
              <TableHead>Event</TableHead>
              <TableHead>Endpoint</TableHead>
              <TableHead>Response</TableHead>
              <TableHead className="text-right">When</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {RECENT_QUEUE.map((item) => (
              <TableRow
                key={item.id}
                className="cursor-pointer"
                onClick={() => setSelectedItem(item)}
              >
                <TableCell>
                  <span
                    className={cn(
                      "block size-2 rounded-full",
                      item.statusCode < 400 ? "bg-primary" : "bg-destructive",
                    )}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs">{item.event}</TableCell>
                <TableCell className="max-w-64 truncate font-mono text-xs text-muted-foreground">
                  {item.targetUrl}
                </TableCell>
                <TableCell>
                  <Badge variant={item.statusCode < 400 ? "default" : "destructive"}>
                    {item.statusCode}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-xs text-muted-foreground">
                  {item.timestamp}
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
