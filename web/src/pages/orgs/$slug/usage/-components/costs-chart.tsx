import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type CostsChartProps = {
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
  clipRendered: {
    label: "Clip Rendered",
    color: "var(--chart-1)",
  },
  thumbnailGenerated: {
    label: "Thumbnail Generated",
    color: "var(--chart-2)",
  },
  seoGenerated: {
    label: "SEO Generated",
    color: "var(--chart-3)",
  },
  audioTranscribed: {
    label: "Audio Transcribed",
    color: "var(--chart-4)",
  },
  bestMomentsGenerated: {
    label: "Best Moments Generated",
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function CostsChart({ data }: CostsChartProps) {
  return (
    <div className="bg-card border border-border p-4 rounded-md">
      <ChartContainer
        config={chartConfig}
        className="aspect-auto h-62.5 w-full"
      >
        <BarChart
          accessibilityLayer
          data={data}
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
              />
            }
          />
          <ChartLegend
            content={
              <ChartLegendContent
                payload={Object.entries(chartConfig).map(([key, value]) => ({
                  value: value.label,
                  dataKey: key,
                  type: "square",
                  color: `var(--color-${key})`,
                }))}
              />
            }
          />
          <Bar
            dataKey="clipRendered"
            stackId="cost"
            fill="var(--color-clipRendered)"
            maxBarSize={96}
          />
          <Bar
            dataKey="thumbnailGenerated"
            stackId="cost"
            fill="var(--color-thumbnailGenerated)"
            maxBarSize={96}
          />
          <Bar
            dataKey="seoGenerated"
            stackId="cost"
            fill="var(--color-seoGenerated)"
            maxBarSize={96}
          />
          <Bar
            dataKey="audioTranscribed"
            stackId="cost"
            fill="var(--color-audioTranscribed)"
            maxBarSize={96}
          />
          <Bar
            dataKey="bestMomentsGenerated"
            stackId="cost"
            fill="var(--color-bestMomentsGenerated)"
            radius={[4, 4, 0, 0]}
            maxBarSize={96}
          />
        </BarChart>
      </ChartContainer>
    </div>
  );
}
