import { ChevronDown, RotateCw } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

type Delivery = {
  id: string
  event: string
  timestamp: string
  statusCode: number | null
  status: "success" | "failed"
  attempt: number
  responseBody: string | null
}

const MOCK_DELIVERIES: Delivery[] = [
  {
    id: "1",
    event: "post.published",
    timestamp: "5 minutes ago",
    statusCode: 200,
    status: "success",
    attempt: 1,
    responseBody: '{\n  "received": true\n}',
  },
  {
    id: "2",
    event: "post.published",
    timestamp: "2 hours ago",
    statusCode: 200,
    status: "success",
    attempt: 1,
    responseBody: '{\n  "received": true\n}',
  },
  {
    id: "3",
    event: "post.failed",
    timestamp: "3 hours ago",
    statusCode: 500,
    status: "failed",
    attempt: 3,
    responseBody:
      '{\n  "error": "Internal Server Error",\n  "message": "Unhandled exception in webhook handler"\n}',
  },
  {
    id: "4",
    event: "post.published",
    timestamp: "1 day ago",
    statusCode: 200,
    status: "success",
    attempt: 1,
    responseBody: '{\n  "received": true\n}',
  },
  {
    id: "5",
    event: "post.failed",
    timestamp: "2 days ago",
    statusCode: null,
    status: "failed",
    attempt: 3,
    responseBody: null,
  },
]

interface WebhookDeliveriesSheetProps {
  endpointUrl: string | null
  onOpenChange: (open: boolean) => void
}

export function WebhookDeliveriesSheet({
  endpointUrl,
  onOpenChange,
}: WebhookDeliveriesSheetProps) {
  return (
    <Sheet open={!!endpointUrl} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-md">
        <SheetHeader className="border-b">
          <SheetTitle>Deliveries</SheetTitle>
          <SheetDescription>
            Recent delivery attempts for{" "}
            <span className="font-mono text-foreground">{endpointUrl}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-3 overflow-y-auto px-4 pb-4">
          {MOCK_DELIVERIES.map((delivery) => (
            <Collapsible key={delivery.id} className="rounded-md border">
              <div className="flex items-center justify-between gap-3 p-3">
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="font-mono">
                      {delivery.event}
                    </Badge>
                    <Badge
                      variant={
                        delivery.status === "success" ? "success" : "destructive"
                      }
                    >
                      {delivery.statusCode ?? "Timeout"}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {delivery.timestamp}
                    {delivery.attempt > 1 && ` · attempt ${delivery.attempt}`}
                  </p>
                </div>
                <Button variant="outline" size="icon-sm" aria-label="Resend event">
                  <RotateCw className="size-3.5" />
                </Button>
              </div>

              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start rounded-none border-t text-xs text-muted-foreground [&_svg]:transition-transform data-[state=open]:[&_svg]:rotate-180"
                >
                  <ChevronDown className="size-3.5" />
                  Response body
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="border-t p-3">
                  {delivery.responseBody ? (
                    <pre className="overflow-x-auto rounded-md bg-muted/50 p-2 font-mono text-xs text-foreground">
                      <code>{delivery.responseBody}</code>
                    </pre>
                  ) : (
                    <p className="text-xs text-muted-foreground">
                      No response received (request timed out).
                    </p>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  )
}
