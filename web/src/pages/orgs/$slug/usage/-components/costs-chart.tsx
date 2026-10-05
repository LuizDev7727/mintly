import type { ReactNode } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { UsageGranularity } from "./aggregate-usage-series";

type CostsChartProps = {
  title: string;
  description: string;
  /** Controles do período, renderizados no canto direito do cabeçalho. */
  action?: ReactNode;
  granularity: UsageGranularity;
  data: {
    date: string;
    clipRendered: number;
    thumbnailGenerated: number;
    seoGenerated: number;
    audioTranscribed: number;
    bestMomentsGenerated: number;
  }[];
};

const chartConfig = {
  total: {
    label: "Total usage",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const brlFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function CostsChart({
  title,
  description,
  action,
  granularity,
  data,
}: CostsChartProps) {
  const totals = data.map((point) => ({
    date: point.date,
    total:
      point.clipRendered +
      point.thumbnailGenerated +
      point.seoGenerated +
      point.audioTranscribed +
      point.bestMomentsGenerated,
  }));

  return (
    <div className="flex flex-1 flex-col gap-6 bg-card dark:bg-zinc-900/20 border border-border p-5 rounded-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-base font-medium">{title}</h2>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
      <ChartContainer
        config={chartConfig}
        className="aspect-auto min-h-62.5 w-full flex-1"
      >
        <BarChart
          accessibilityLayer
          data={totals}
          barCategoryGap="15%"
          margin={{
            top: 8,
            left: 0,
            right: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" />
          <YAxis
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            width={68}
            tickFormatter={(value) => brlFormatter.format(value)}
            allowDecimals={false}
          />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            minTickGap={32}
            tickFormatter={(value) => {
              const date = new Date(value);
              return date.toLocaleDateString(
                "en-US",
                granularity === "monthly"
                  ? { month: "short" }
                  : { month: "short", day: "numeric" },
              );
            }}
          />
          <ChartTooltip
            cursor={{ fill: "var(--muted)", opacity: 0.3 }}
            content={
              <ChartTooltipContent
                formatter={(value) => (
                  <>
                    <span className="size-2.5 shrink-0 rounded-[2px] bg-(--color-total)" />
                    <div className="flex flex-1 items-center justify-between gap-4 leading-none">
                      <span className="text-muted-foreground">Total usage</span>
                      <span className="font-mono font-medium text-foreground tabular-nums">
                        {brlFormatter.format(Number(value))}
                      </span>
                    </div>
                  </>
                )}
                labelFormatter={(value) => {
                  const date = new Date(value);
                  if (granularity === "monthly") {
                    return date.toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    });
                  }
                  const formatted = date.toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  });
                  return granularity === "weekly"
                    ? `Week of ${formatted}`
                    : formatted;
                }}
              />
            }
          />
          <Bar
            dataKey="total"
            fill="var(--color-total)"
            radius={[4, 4, 0, 0]}
            maxBarSize={96}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
