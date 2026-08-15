import {
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RotateCw,
  Send,
  XCircle,
} from "lucide-react"
import { Line, LineChart, ResponsiveContainer } from "recharts"
import { cn } from "@/lib/utils"

type Stat = {
  label: string
  value: string
  icon: typeof Send
  iconClassName: string
  trend: { direction: "up" | "down"; label: string }
  sparklineColor: string
  sparkline: number[]
}

const STATS: Stat[] = [
  {
    label: "Total Deliveries",
    value: "458",
    icon: Send,
    iconClassName: "bg-sky-500/10 text-sky-500",
    trend: { direction: "up", label: "12% from yesterday" },
    sparklineColor: "#0ea5e9",
    sparkline: [12, 18, 14, 22, 19, 26, 24, 30, 27, 34],
  },
  {
    label: "Successful",
    value: "424",
    icon: CheckCircle2,
    iconClassName: "bg-lime-300/10 text-lime-500",
    trend: { direction: "up", label: "15% from yesterday" },
    sparklineColor: "#bef264",
    sparkline: [10, 16, 13, 20, 18, 24, 22, 28, 25, 32],
  },
  {
    label: "Failed",
    value: "29",
    icon: XCircle,
    iconClassName: "bg-destructive/10 text-destructive",
    trend: { direction: "down", label: "8% from yesterday" },
    sparklineColor: "#ef4444",
    sparkline: [8, 5, 9, 4, 7, 3, 6, 2, 5, 3],
  },
  {
    label: "Pending",
    value: "5",
    icon: Clock,
    iconClassName: "bg-amber-500/10 text-amber-500",
    trend: { direction: "up", label: "2% from yesterday" },
    sparklineColor: "#f59e0b",
    sparkline: [3, 4, 2, 5, 3, 6, 4, 5, 4, 5],
  },
  {
    label: "Retry Rate",
    value: "50%",
    icon: RotateCw,
    iconClassName: "bg-violet-500/10 text-violet-500",
    trend: { direction: "down", label: "5% from yesterday" },
    sparklineColor: "#8b5cf6",
    sparkline: [60, 55, 58, 52, 54, 48, 51, 47, 49, 50],
  },
]

function Sparkline({ data, color }: { data: number[]; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={32}>
      <LineChart
        data={data.map((value, index) => ({ index, value }))}
        margin={{ top: 2, right: 0, bottom: 0, left: 0 }}
      >
        <Line
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={1.5}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}

export function WebhookStatsSection() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {STATS.map((stat) => {
        const Icon = stat.icon
        const TrendIcon =
          stat.trend.direction === "up" ? ArrowUpRight : ArrowDownRight

        return (
          <div
            key={stat.label}
            className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4"
          >
            <div
              className={cn(
                "flex size-8 items-center justify-center rounded-md",
                stat.iconClassName,
              )}
            >
              <Icon className="size-4" />
            </div>

            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendIcon
                className={cn(
                  "size-3",
                  stat.trend.direction === "up"
                    ? "text-primary"
                    : "text-destructive",
                )}
              />
              {stat.trend.label}
            </div>

            <Sparkline data={stat.sparkline} color={stat.sparklineColor} />
          </div>
        )
      })}
    </div>
  )
}
