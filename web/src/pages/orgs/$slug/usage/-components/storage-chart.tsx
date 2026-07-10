import { Area, AreaChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBytes } from "@/utils/format-bytes";

const chartData = [
  { date: "2024-05-01", storage: 40_000_000 },
  { date: "2024-05-02", storage: 52_000_000 },
  { date: "2024-05-03", storage: 58_000_000 },
  { date: "2024-05-04", storage: 71_000_000 },
  { date: "2024-05-05", storage: 79_000_000 },
  { date: "2024-05-06", storage: 88_000_000 },
  { date: "2024-05-07", storage: 96_000_000 },
  { date: "2024-05-08", storage: 108_000_000 },
  { date: "2024-05-09", storage: 121_000_000 },
  { date: "2024-05-10", storage: 129_000_000 },
  { date: "2024-05-11", storage: 138_000_000 },
  { date: "2024-05-12", storage: 152_000_000 },
  { date: "2024-05-13", storage: 165_000_000 },
  { date: "2024-05-14", storage: 178_000_000 },
  { date: "2024-05-15", storage: 184_000_000 },
  { date: "2024-05-16", storage: 197_000_000 },
  { date: "2024-05-17", storage: 213_000_000 },
  { date: "2024-05-18", storage: 226_000_000 },
  { date: "2024-05-19", storage: 234_000_000 },
  { date: "2024-05-20", storage: 249_000_000 },
  { date: "2024-05-21", storage: 262_000_000 },
  { date: "2024-05-22", storage: 275_000_000 },
  { date: "2024-05-23", storage: 289_000_000 },
  { date: "2024-05-24", storage: 301_000_000 },
  { date: "2024-05-25", storage: 318_000_000 },
  { date: "2024-05-26", storage: 332_000_000 },
  { date: "2024-05-27", storage: 347_000_000 },
  { date: "2024-05-28", storage: 361_000_000 },
  { date: "2024-05-29", storage: 375_000_000 },
  { date: "2024-05-30", storage: 392_000_000 },
];

const chartConfig = {
  storage: {
    label: "Storage",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StorageChart() {
  return (
    <div className="bg-card border border-border p-4 rounded-md">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-62.5 w-full"
      >
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{
            left: 0,
            right: 0,
          }}
        >
          {/*<CartesianGrid vertical={false} />*/}
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
          <ChartTooltip
            cursor={false}
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
                        style={{ backgroundColor: "var(--color-storage)" }}
                      />
                      <span className="text-muted-foreground">Storage</span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {formatBytes(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Area
            dataKey="storage"
            type="monotone"
            fill="var(--color-storage)"
            fillOpacity={0.85}
            stroke="var(--color-storage)"
            strokeWidth={2}
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}
