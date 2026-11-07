import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getChannelsHttp } from "@/http/channel/get-channels.http";
import { ChannelCard } from "./channel-card";

export function ChannelsList() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["channels", slug],
    queryFn: () => getChannelsHttp({ orgSlug: slug }),
  });

  const { channels } = data;

  return (
    <>
      {channels.map((channel) => (
        <ChannelCard key={channel.id} channel={channel} />
      ))}
    </>
  );
}
