import { Badge } from "@/components/ui/badge";
import { getOrganizationMetricsHttp } from "@/http/organization/get-organization-metrics.http";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ChartPie, Package, Users } from "lucide-react";

export function Metrics() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["metrics", slug],
    queryFn: () => getOrganizationMetricsHttp({ orgSlug: slug }),
  });

  const { totalChannels, totalMembers, totalUsage } = data.metrics;

  const formattedUsage = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalUsage / 100);

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="size-4" />
          <span className="text-sm">Channels</span>
        </div>
        <p className="text-2xl font-bold">{totalChannels}</p>
      </div>
      <div className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Users className="size-4" />
          <span className="text-sm">Members</span>
        </div>
        <p className="text-2xl font-bold">{totalMembers}</p>
      </div>
      <div className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-muted-foreground">
            <ChartPie className="size-4" />
            <span className="text-sm">Usage</span>
          </div>
          <Badge variant="outline">+12.5%</Badge>
        </div>
        <p className="text-2xl font-bold">{formattedUsage}</p>
      </div>
    </div>
  );
}
