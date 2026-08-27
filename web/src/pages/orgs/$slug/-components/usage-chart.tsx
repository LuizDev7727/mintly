import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Info } from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const chartData = [
  { date: "2025-06-01", usage: 0.09 },
  { date: "2025-06-02", usage: 0.1 },
  { date: "2025-06-03", usage: 0.11 },
  { date: "2025-06-04", usage: 0.13 },
  { date: "2025-06-05", usage: 0.16 },
  { date: "2025-06-06", usage: 0.2 },
  { date: "2025-06-07", usage: 0.18 },
  { date: "2025-06-08", usage: 0.19 },
  { date: "2025-06-09", usage: 0.17 },
  { date: "2025-06-10", usage: 0.13 },
  { date: "2025-06-11", usage: 0.08 },
  { date: "2025-06-12", usage: 0.1 },
  { date: "2025-06-13", usage: 0.14 },
  { date: "2025-06-14", usage: 0.17 },
  { date: "2025-06-15", usage: 0.19 },
  { date: "2025-06-16", usage: 0.18 },
  { date: "2025-06-17", usage: 0.14 },
  { date: "2025-06-18", usage: 0.1 },
  { date: "2025-06-19", usage: 0.09 },
  { date: "2025-06-20", usage: 0.12 },
  { date: "2025-06-21", usage: 0.17 },
  { date: "2025-06-22", usage: 0.2 },
  { date: "2025-06-23", usage: 0.16 },
  { date: "2025-06-24", usage: 0.12 },
  { date: "2025-06-25", usage: 0.15 },
  { date: "2025-06-26", usage: 0.19 },
  { date: "2025-06-27", usage: 0.22 },
  { date: "2025-06-28", usage: 0.25 },
  { date: "2025-06-29", usage: 0.27 },
  { date: "2025-06-30", usage: 0.3 },
];

const chartConfig = {
  usage: {
    label: "Usage",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function UsageChart() {
  return (
    <div className="rounded-lg border dark:bg-zinc-900/20 p-5">
      <div className="flex items-center justify-between pb-4">
        <div className="flex items-center gap-1.5">
          <h3 className="text-sm font-medium">Usage over time</h3>
          <Tooltip>
            <TooltipTrigger asChild>
              <Info className="size-3.5 text-muted-foreground" />
            </TooltipTrigger>
            <TooltipContent>
              Total usage cost per day over the last 30 days.
            </TooltipContent>
          </Tooltip>
        </div>
        <p className="text-xs text-muted-foreground">Last 30 days</p>
      </div>

      <ChartContainer config={chartConfig} className="aspect-auto h-62.5 w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 0,
            right: 0,
          }}
        >
          <defs>
            <linearGradient id="fillUsage" x1="0" y1="0" x2="0" y2="1">
              <stop
                offset="5%"
                stopColor="var(--color-usage)"
                stopOpacity={0.5}
              />
              <stop
                offset="95%"
                stopColor="var(--color-usage)"
                stopOpacity={0.05}
              />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
            }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={64}
            tickFormatter={(value) => currencyFormatter.format(Number(value))}
          />
          <ChartTooltip
            cursor={{ stroke: "var(--border)", strokeDasharray: "4 4" }}
            content={
              <ChartTooltipContent
                labelFormatter={(value) =>
                  new Date(value).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                }
                formatter={(value) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-2.5 w-2.5 shrink-0 rounded-xs"
                        style={{ backgroundColor: "var(--color-usage)" }}
                      />
                      <span className="text-muted-foreground">Usage</span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {currencyFormatter.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="usage"
            type="monotone"
            fill="url(#fillUsage)"
            stroke="var(--color-usage)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "var(--color-usage)",
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
