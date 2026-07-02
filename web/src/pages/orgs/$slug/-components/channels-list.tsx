import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { getChannelsHttp } from "@/http/channel/get-channels.http";
import { ChannelsListEmpty } from "./channel-list-empty";
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

  const isChannelsEmpty = channels.length === 0;

  if (isChannelsEmpty) {
    return <ChannelsListEmpty />;
  }

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
      {channels.map((channel) => (
        <ChannelCard
          key={channel.id}
          id={channel.id}
          slug={channel.slug}
          title={channel.name}
          postsCount={channel.postsCount}
          integrationsCount={channel.integrationsCount}
          totalSize={channel.totalPostsSize}
          postsSize={channel.postsSize}
        />
      ))}
    </div>
  );
}
