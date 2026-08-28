import { useParams, Link } from "@tanstack/react-router";
import { Link2, MoreHorizontal, Webhook } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Webhook as WebhookType } from "@/types/webhook";

interface WebhooksProps {
  webhooks: WebhookType[];
}

export function Webhooks({ webhooks }: WebhooksProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <div className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Webhook endpoints</h3>
        <Link
          to="/orgs/$slug/webhooks"
          params={{ slug }}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      {webhooks.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-md border border-dashed py-8 text-center">
          <Webhook className="size-5 text-muted-foreground" />
          <p className="max-w-56 text-xs text-muted-foreground">
            Create a webhook to get notified about events in real time.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {webhooks.map((webhook) => {
            const isFailing = webhook.lastLog?.status === "FAILED";

            return (
              <div
                key={webhook.id}
                className="flex items-center gap-2 rounded-md border px-3 py-2.5"
              >
                <Link2 className="size-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate font-mono text-xs">
                  {webhook.url}
                </span>
                <Badge
                  variant={isFailing ? "destructive" : "default"}
                  className="shrink-0"
                >
                  {isFailing ? "Failing" : "Active"}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
