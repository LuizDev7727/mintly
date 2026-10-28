import { useMemo, useState } from "react"
import { format } from "date-fns"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import type { WebhookLog } from "@/http/webhook/get-webhook.http"

const MINUTE = 60_000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

const RANGES = {
  "15m": { label: "15m", description: "Last 15 minutes", duration: 15 * MINUTE, bucket: 30_000 },
  "1h": { label: "1h", description: "Last 1 hour", duration: HOUR, bucket: 2 * MINUTE },
  "24h": { label: "24h", description: "Last 24 hours", duration: DAY, bucket: HOUR },
  "7d": { label: "7d", description: "Last 7 days", duration: 7 * DAY, bucket: 6 * HOUR },
} as const

type RangeKey = keyof typeof RANGES

const chartConfig = {
  success: { label: "Success", color: "var(--primary)" },
  pending: { label: "Pending", color: "var(--chart-4)" },
  failed: { label: "Failed", color: "var(--destructive)" },
} satisfies ChartConfig

type ChartSeries = keyof typeof chartConfig

type Bucket = Record<ChartSeries, number> & { time: number }

const STATUS_SERIES = {
  SUCCESS: "success",
  PENDING: "pending",
  FAILED: "failed",
} as const

interface WebhookDeliveriesChartProps {
  logs: WebhookLog[]
}

export function WebhookDeliveriesChart({ logs }: WebhookDeliveriesChartProps) {
  const [range, setRange] = useState<RangeKey>("1h")

  const { duration, bucket, description } = RANGES[range]

  const { buckets, total } = useMemo(() => {
    const end = Date.now()
    const start = end - duration
    const count = Math.ceil(duration / bucket)

    const buckets: Bucket[] = Array.from({ length: count }, (_, index) => ({
      time: start + index * bucket,
      success: 0,
      pending: 0,
      failed: 0,
    }))

    let total = 0

    for (const log of logs) {
      const createdAt = new Date(log.createdAt).getTime()

      if (createdAt < start || createdAt > end) continue

      const index = Math.min(Math.floor((createdAt - start) / bucket), count - 1)
      buckets[index][STATUS_SERIES[log.status]] += 1
      total += 1
    }

    return { buckets, total }
  }, [logs, duration, bucket])

  const hasTime = duration <= DAY

  return (
    <div className="space-y-4 p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium">Deliveries</h2>
          <p className="text-xs text-muted-foreground">
            <span className="font-mono font-medium text-foreground">
              {total.toLocaleString("en-US")}
            </span>{" "}
            {total === 1 ? "delivery" : "deliveries"} · {description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <ul className="flex items-center gap-3 text-xs text-muted-foreground">
            {(Object.keys(chartConfig) as ChartSeries[]).map((series) => (
              <li key={series} className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-xs"
                  style={{ backgroundColor: chartConfig[series].color }}
                />
                {chartConfig[series].label}
              </li>
            ))}
          </ul>

          <ToggleGroup
            type="single"
            variant="outline"
            size="sm"
            value={range}
            onValueChange={(value) => value && setRange(value as RangeKey)}
          >
            {(Object.keys(RANGES) as RangeKey[]).map((key) => (
              <ToggleGroupItem key={key} value={key} aria-label={RANGES[key].description}>
                {RANGES[key].label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
      </div>

      <ChartContainer config={chartConfig} className="aspect-auto h-48 w-full">
        <BarChart accessibilityLayer data={buckets} barCategoryGap={3}>
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <XAxis
            dataKey="time"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={40}
            tickFormatter={(value) => format(value, hasTime ? "HH:mm" : "MMM d")}
          />
          <YAxis tickLine={false} axisLine={false} tickMargin={8} width={28} allowDecimals={false} />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.4 }}
            content={
              <ChartTooltipContent
                labelFormatter={(_, payload) =>
                  format(payload[0].payload.time, hasTime ? "MMM d, HH:mm" : "MMM d, yyyy")
                }
              />
            }
          />
          <Bar dataKey="success" stackId="deliveries" fill="var(--color-success)" radius={[0, 0, 2, 2]} />
          <Bar dataKey="pending" stackId="deliveries" fill="var(--color-pending)" />
          <Bar dataKey="failed" stackId="deliveries" fill="var(--color-failed)" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </div>
  )
}
