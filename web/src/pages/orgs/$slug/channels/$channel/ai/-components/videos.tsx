import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { parseAsInteger, useQueryState } from "nuqs";
import { getVideosHttp } from "@/http/video/get-videos.http";
import { VideosPagination } from "./videos-pagination";
import { VideosCard } from "./videos-card";
import { VideosEmpty } from "./videos-empty";

export function Videos() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [pageIndex] = useQueryState(
    "page",
    parseAsInteger.withDefault(0),
  );

  const { data } = useSuspenseQuery({
    queryKey: ["videos", slug, channel, pageIndex],
    queryFn: () =>
      getVideosHttp({
        orgSlug: slug,
        channelId: channel,
        pageIndex,
      }),
  });

  const { videos, meta } = data;

  const hasVideos = videos.length > 0;
  const hasPagination = meta.totalPages > 1;

  if (!hasVideos && pageIndex === 0) {
    return <VideosEmpty />;
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <ul className="divide-y">
        {videos.map((video) => (
          <VideosCard key={video.id} video={video} />
        ))}
      </ul>

      {hasPagination && <VideosPagination totalPages={meta.totalPages} />}
    </div>
  );
}
