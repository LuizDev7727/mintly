import { createFileRoute } from "@tanstack/react-router";
import { CreateChannelDialog } from "@/components/create-channel-dialog";
import { Separator } from "@/components/ui/separator";
import { Suspense } from "react";
import { ChannelsListLoading } from "./-components/channel-list-loading";
import { ChannelsList } from "./-components/channels-list";
import { Metrics } from "./-components/metrics";
import { MetricsLoading } from "./-components/metrics-loading";

export const Route = createFileRoute("/orgs/$slug/")({
  component: ChannelsPage,
});

function ChannelsPage() {
  return (
    <div className="space-y-4 h-full">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-medium">Channels</h1>
        <CreateChannelDialog />
      </div>

      <Suspense fallback={<MetricsLoading />}>
        <Metrics />
      </Suspense>

      <Separator />

      <Suspense fallback={<ChannelsListLoading />}>
        <ChannelsList />
      </Suspense>
    </div>
  );
}
