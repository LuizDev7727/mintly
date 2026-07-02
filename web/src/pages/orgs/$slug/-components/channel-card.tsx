import { Button } from "@/components/ui/button";
import { formatBytes } from "@/utils/format-bytes";
import { Link, useParams } from "@tanstack/react-router";
import { ChevronRight, HardDrive, Plug, TvMinimal, Upload } from "lucide-react";
import { Area, AreaChart } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

type ChannelCardProps = {
  id: string;
  title: string;
  slug: string;
  postsCount: number;
  integrationsCount: number;
  totalSize: number;
  postsSize: { size: number }[];
};

const chartConfig = {
  size: {
    label: "Size",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig;

export function ChannelCard({
  id,
  title,
  slug: channelSlug,
  postsCount = 0,
  integrationsCount = 0,
  totalSize = 0,
  postsSize = [],
}: ChannelCardProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const chartData =
    postsSize.length >= 1
      ? postsSize
      : Array.from({ length: 6 }, () => ({ size: 0 }));

  return (
    <div className="min-w-0 w-full rounded-md border border-border bg-transparent">
      <header className="p-4 flex items-center justify-between gap-x-2">
        <div className="flex gap-x-2">
          <div className="flex items-center justify-center p-2 rounded-md border">
            <TvMinimal className="size-4" />
          </div>
          <div>
            <h3 className="text-[15px] font-semibold leading-[1.3]">{title}</h3>
            <div className="mt-1 flex items-center gap-2.5">
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Upload className="size-3.5" />
                {postsCount} posts
              </span>
              <span className="text-[13px] text-border">·</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Plug className="size-3.5" />
                {integrationsCount} integrations
              </span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="bg-transparent!" asChild>
          <Link
            to="/orgs/$slug/channels/$channel"
            params={{ slug, channel: id }}
          >
            See channel
            <ChevronRight className="size-4" />
          </Link>
        </Button>
      </header>

      <ChartContainer config={chartConfig} className="h-32 w-full">
        <AreaChart
          accessibilityLayer
          data={chartData}
          margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
        >
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent indicator="dot" hideLabel />}
          />
          <Area
            dataKey="size"
            type="linear"
            fill="var(--color-primary)"
            fillOpacity={0.4}
            stroke="var(--color-primary)"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>

      <footer className="p-4 border border-transparent border-t-border flex items-center justify-between">
        <p className="text-sm flex items-center gap-x-1 text-muted-foreground">
          <HardDrive className="size-4" /> Total Size
        </p>
        <p className="text-sm">{formatBytes(totalSize)}</p>
      </footer>
    </div>
  );
}
