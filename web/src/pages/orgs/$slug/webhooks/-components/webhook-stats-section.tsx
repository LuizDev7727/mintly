import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCw,
  Send,
  XCircle,
} from "lucide-react"
import { cn } from "@/lib/utils"
import type { GetWebhooksOverviewResponse } from "@/http/webhook/get-webhooks-overview.http"
import { Sparkline } from "@/components/sparkline"

type MetricKey = keyof GetWebhooksOverviewResponse["metrics"]

const METRIC_ORDER: MetricKey[] = [
  "totalDeliveries",
  "successful",
  "failed",
  "pending",
  "retryRate",
]

const METRIC_CONFIG: Record<
  MetricKey,
  {
    label: string
    icon: typeof Send
    iconClassName: string
    sparklineColor: string
    formatValue: (value: number) => string
  }
> = {
  totalDeliveries: {
    label: "Total Deliveries",
    icon: Send,
    iconClassName: "bg-sky-500/10 text-sky-500",
    sparklineColor: "#0ea5e9",
    formatValue: (value) => String(value),
  },
  successful: {
    label: "Successful",
    icon: CheckCircle2,
    iconClassName: "bg-lime-300/10 text-lime-500",
    sparklineColor: "#bef264",
    formatValue: (value) => String(value),
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    iconClassName: "bg-destructive/10 text-destructive",
    sparklineColor: "#ef4444",
    formatValue: (value) => String(value),
  },
  pending: {
    label: "Pending",
    icon: Clock,
    iconClassName: "bg-amber-500/10 text-amber-500",
    sparklineColor: "#f59e0b",
    formatValue: (value) => String(value),
  },
  retryRate: {
    label: "Retry Rate",
    icon: RotateCw,
    iconClassName: "bg-violet-500/10 text-violet-500",
    sparklineColor: "#8b5cf6",
    formatValue: (value) => `${value}%`,
  },
}

interface WebhookStatsSectionProps {
  metrics: GetWebhooksOverviewResponse["metrics"]
}

export function WebhookStatsSection({ metrics }: WebhookStatsSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {METRIC_ORDER.map((key) => {
        const config = METRIC_CONFIG[key]
        const metric = metrics[key]
        const Icon = config.icon
        const direction = metric.trend >= 0 ? "up" : "down"
        const TrendIcon = direction === "up" ? ArrowUpRight : ArrowDownRight

        return (
          <div
            key={key}
            className="rounded-lg border dark:bg-zinc-900/20 overflow-hidden"
          >
            <div className="px-5 pt-5 space-y-3">
              <div
                className={cn(
                  "flex size-8 items-center justify-center rounded-md",
                  config.iconClassName,
                )}
              >
                <Icon className="size-4" />
              </div>

              <div>
                <p className="text-2xl font-bold text-foreground">
                  {config.formatValue(metric.value)}
                </p>
                <p className="text-sm text-muted-foreground">{config.label}</p>
              </div>

              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <TrendIcon
                  className={cn(
                    "size-3",
                    direction === "up" ? "text-primary" : "text-destructive",
                  )}
                />
                {Math.abs(metric.trend)}% from yesterday
              </div>
            </div>

            <Sparkline data={metric.sparkline} color={config.sparklineColor} />
          </div>
        )
      })}
    </div>
  )
}
