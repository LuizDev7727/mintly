import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getChannelsHttp } from "@/http/channel/get-channels.http";
import { useViewMode } from "@/context/view-mode-context";
import { ChannelsListEmpty } from "./channel-list-empty";
import { ChannelGridView } from "./channel-grid-view";
import { ChannelListView } from "./channel-list-view";

export function ChannelsList() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { view } = useViewMode();

  const { data } = useSuspenseQuery({
    queryKey: ["channels", slug],
    queryFn: () => getChannelsHttp({ orgSlug: slug }),
  });

  const { channels } = data;

  const isChannelsEmpty = channels.length === 0;

  if (isChannelsEmpty) {
    return <ChannelsListEmpty />;
  }

  return (
    <>
      {view === "grid" && <ChannelGridView channels={channels} />}
      {view === "list" && <ChannelListView channels={channels} />}
    </>
  );
}
