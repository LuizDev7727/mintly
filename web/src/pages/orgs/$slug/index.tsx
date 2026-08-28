import { createFileRoute, Link } from "@tanstack/react-router";
import { Webhooks } from "./-components/webhooks";
import { Activities } from "./-components/activities";
import { HardDrive, Package, Users } from "lucide-react";
import { Sparkline } from "@/components/sparkline";
import { useQuery } from "@tanstack/react-query";
import { getOrganizationOverviewHttp } from "@/http/organization/get-organization-overview.http";
import { formatBytes } from "@/utils/format-bytes";

export const Route = createFileRoute("/orgs/$slug/")({
  component: OverviewPage,
  head: () => ({
    meta: [
      { title: "Overview | Mintly" },
      { name: "description", content: "Organization overview." },
    ],
  }),
});

function OverviewPage() {
  const { slug } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ['overview', slug],
    queryFn: () => getOrganizationOverviewHttp({ orgSlug: slug })
  })

  if (!data || isLoading) {
    return <p>Loading...</p>
  }

  const { overview } = data;

  const { channelsCount, membersCount, usage, storage, recentActivities, webhooks } = overview;
  const { totalUsage } = usage;


  const formattedUsage = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(totalUsage / 100);


  return (
    <div className="space-y-4 h-full">
      <div>
        <h1 className="text-xl font-medium">Overview</h1>
        <p className="text-sm">Here's what's hapenning with your organization today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Link
          to="/orgs/$slug/channels"
          params={{ slug }}
          className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-900/40"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Package className="size-4" />
            <span className="text-sm">Channels</span>
          </div>
          <p className="text-2xl font-bold">{channelsCount}</p>
        </Link>
        <Link
          to="/orgs/$slug/members"
          params={{ slug }}
          className="rounded-lg border dark:bg-zinc-900/20 p-5 flex flex-col gap-3 transition-colors hover:bg-muted/50 dark:hover:bg-zinc-900/40"
        >
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="size-4" />
            <span className="text-sm">Members</span>
          </div>
          <p className="text-2xl font-bold">{membersCount}</p>
        </Link>
        <div className="rounded-lg border dark:bg-zinc-900/20 overflow-hidden">
          <div className="px-5 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="size-4" />
                <span className="text-sm">Usage</span>
              </div>
              <p className="text-xs text-muted-foreground">vs last 30 days</p>
            </div>
            <p className="text-2xl font-bold">{formattedUsage}</p>
          </div>
          <Sparkline data={[10, 20, 600, 1000, 840, 40]} color={"#bef264"} />
        </div>
        <div className="rounded-lg border dark:bg-zinc-900/20 overflow-hidden">
          <div className="px-5 pt-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <HardDrive className="size-4" />
                <span className="text-sm">Storage</span>
              </div>
              <p className="text-xs text-muted-foreground">vs last 30 days</p>
            </div>
            <p className="text-2xl font-bold">{formatBytes(storage.totalStorage)}</p>
          </div>
          <Sparkline data={storage.series} color={"#bef264"} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <Webhooks webhooks={webhooks} />
        </div>
        <div className="space-y-4">
          <Activities
            activities={recentActivities}
          />
        </div>
      </div>

    </div>
  );
}
