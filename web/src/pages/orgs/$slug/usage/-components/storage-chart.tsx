import { Area, AreaChart, XAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatBytes } from "@/utils/format-bytes";

type StorageChartProps = {
  data: {
    date: string;
    storage: number;
  }[];
};

const chartConfig = {
  storage: {
    label: "Storage",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function StorageChart({ data }: StorageChartProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-md">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-62.5 w-full"
      >
        <AreaChart
          accessibilityLayer
          data={data}
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
