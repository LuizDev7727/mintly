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
import type { QueueItem } from "./recent-deliveries-section"

function DetailRows({ data }: { data: { key: string; value: string }[] }) {
  return (
    <div className="divide-y rounded-md border">
      {data.map((item) => (
        <div
          key={item.key}
          className="flex items-center justify-between gap-4 px-3 py-2 text-sm"
        >
          <span className="text-muted-foreground">{item.key}</span>
          <span className="truncate font-mono text-xs text-foreground">
            {item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

interface WebhookDeliveryDetailsSheetProps {
  item: QueueItem | null
  onOpenChange: (open: boolean) => void
}

export function WebhookDeliveryDetailsSheet({
  item,
  onOpenChange,
}: WebhookDeliveryDetailsSheetProps) {
  const overviewRows = item
    ? [
        { key: "Method", value: item.method },
        { key: "Status Code", value: String(item.statusCode) },
        { key: "Content-Type", value: "application/json" },
        {
          key: "Content-Length",
          value: `${item.requestBody.length} bytes`,
        },
      ]
    : []

  const headerRows = item
    ? Object.entries(item.headers).map(([key, value]) => ({ key, value }))
    : []

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <Badge>{item?.method}</Badge>
            <SheetTitle className="truncate font-mono text-sm font-normal">
              {item?.targetUrl}
            </SheetTitle>
          </div>
          <SheetDescription>
            Event <span className="font-mono text-foreground">{item?.event}</span>{" "}
            · {item?.timestamp}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Request Overview</h3>
            <DetailRows data={overviewRows} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Headers</h3>
            <DetailRows data={headerRows} />
          </div>

          {item && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Request Body</h3>
                <CopyButton value={item.requestBody} />
              </div>
              <CodeBlock code={item.requestBody} language="json" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
