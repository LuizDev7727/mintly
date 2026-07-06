import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartData = [
  { date: "2024-05-01", cost: 12 },
  { date: "2024-05-02", cost: 18 },
  { date: "2024-05-03", cost: 9 },
  { date: "2024-05-04", cost: 24 },
  { date: "2024-05-05", cost: 15 },
  { date: "2024-05-06", cost: 21 },
  { date: "2024-05-07", cost: 20 },
  { date: "2024-05-08", cost: 11 },
  { date: "2024-05-09", cost: 19 },
  { date: "2024-05-10", cost: 26 },
  { date: "2024-05-11", cost: 14 },
  { date: "2024-05-12", cost: 8 },
  { date: "2024-05-13", cost: 22 },
  { date: "2024-05-14", cost: 17 },
  { date: "2024-05-15", cost: 29 },
  { date: "2024-05-16", cost: 13 },
  { date: "2024-05-17", cost: 20 },
  { date: "2024-05-18", cost: 25 },
  { date: "2024-05-19", cost: 10 },
  { date: "2024-05-20", cost: 16 },
  { date: "2024-05-21", cost: 23 },
  { date: "2024-05-22", cost: 27 },
  { date: "2024-05-23", cost: 12 },
  { date: "2024-05-24", cost: 19 },
  { date: "2024-05-25", cost: 15 },
  { date: "2024-05-26", cost: 21 },
  { date: "2024-05-27", cost: 28 },
  { date: "2024-05-28", cost: 17 },
  { date: "2024-05-29", cost: 9 },
  { date: "2024-05-30", cost: 24 },
];

const chartConfig = {
  cost: {
    label: "Cost",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function CostsChart() {
  return (
    <div className="bg-card border border-border p-4 rounded-md">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-62.5 w-full"
      >
        <BarChart
          accessibilityLayer
          data={chartData}
          barCategoryGap="15%"
          margin={{
            left: 0,
            right: 0,
          }}
        >
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
                        className="h-2.5 w-2.5 shrink-0"
                        style={{ backgroundColor: "var(--color-cost)" }}
                      />
                      <span className="text-muted-foreground">Cost</span>
                    </div>
                    <span className="font-mono font-medium tabular-nums text-foreground">
                      {currencyFormatter.format(Number(value))}
                    </span>
                  </div>
                )}
              />
            }
          />
          <Bar
            dataKey="cost"
            fill="var(--color-cost)"
            radius={[4, 4, 0, 0]}
            maxBarSize={96}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
