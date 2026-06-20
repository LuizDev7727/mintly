import { createFileRoute } from "@tanstack/react-router";
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
        <UpdateChannelNameForm />
        <DeleteChannel />
      </div>
    </div>
  );
}
