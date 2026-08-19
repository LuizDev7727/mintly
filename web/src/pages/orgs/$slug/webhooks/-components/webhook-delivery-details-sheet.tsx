import { formatDistanceToNow } from "date-fns"
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
import type { RecentDelivery } from "@/http/webhook/get-webhooks-overview.http"

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
  item: RecentDelivery | null
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
        { key: "Content-Type", value: item.contentType ?? "—" },
        {
          key: "Content-Length",
          value:
            item.contentLength !== null
              ? `${item.contentLength} bytes`
              : "—",
        },
        { key: "IP", value: item.ip },
        { key: "Path", value: item.pathname },
      ]
    : []

  const headerRows = item
    ? Object.entries(item.headers).map(([key, value]) => ({ key, value }))
    : []

  const queryParamRows = item?.queryParams
    ? Object.entries(item.queryParams).map(([key, value]) => ({ key, value }))
    : []

  return (
    <Sheet open={!!item} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-2xl">
        <SheetHeader className="border-b">
          <div className="flex items-center gap-2">
            <Badge>{item?.method}</Badge>
            <SheetTitle className="truncate font-mono text-sm font-normal">
              {item?.url}
            </SheetTitle>
          </div>
          <SheetDescription>
            {item &&
              formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-4 pb-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Request Overview</h3>
            <DetailRows data={overviewRows} />
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">Headers</h3>
            {headerRows.length > 0 ? (
              <DetailRows data={headerRows} />
            ) : (
              <p className="text-xs text-muted-foreground">
                No headers recorded for this delivery.
              </p>
            )}
          </div>

          {queryParamRows.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Query Parameters</h3>
              <DetailRows data={queryParamRows} />
            </div>
          )}

          {item?.body && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">Request Body</h3>
                <CopyButton value={item.body} />
              </div>
              <CodeBlock code={item.body} language="json" />
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}
