import { getChannelHttp } from "@/http/channel/get-channel.http";
import { useSuspenseQuery } from "@tanstack/react-query";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { Suspense } from "react";
import { UpdateChannelNameForm } from "./-components/update-channel-name-form";
import { DeleteChannel } from "./-components/delete-channel";

export const Route = createFileRoute("/orgs/$slug/channels/$channel/settings/")(
  {
    head: () => ({
      meta: [
        { title: "Channel Settings | Mintly" },
        { name: "description", content: "Manage your channel settings." },
      ],
    }),
    component: ChannelSettingsPage,
  },
);

function ChannelSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Channel Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your channel settings
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Suspense fallback={<p>Loading...</p>}>
          <ChannelSettingsContent />
        </Suspense>
      </div>
    </div>
  );
}

function ChannelSettingsContent() {
  const { channel: channelId } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data: channel } = useSuspenseQuery({
    queryKey: ["channel", channelId],
    queryFn: () => getChannelHttp({ channelId }),
  });

  return (
    <>
      <UpdateChannelNameForm id={channel.id} name={channel.name} />
      <DeleteChannel id={channel.id} name={channel.name} />
    </>
  );
}
