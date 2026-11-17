import { Spinner } from "@/components/ui/spinner";
import { getBestMomentsHttp } from "@/http/best-moments/get-best-moments.http";
import { getIntegrationsHttp } from "@/http/integration/get-integrations.http";
import {
  useSuspenseInfiniteQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { BestMomentsEmpty } from "./best-moments-empty";
import { BestMomentCard } from "./best-moment-card";
import { useParams } from "@tanstack/react-router";

export function BestMoments() {

  const { slug, channel, projectId } = useParams({
    from:"/orgs/$slug/channels/$channel/projects/$projectId/"
  })

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["best-moments", projectId],
      queryFn: ({ pageParam }) =>
        getBestMomentsHttp({
          orgSlug: slug,
          channelId: channel,
          projectId,
          cursor: pageParam,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
      refetchOnWindowFocus: false
    });

  const { data: integrationsData } = useSuspenseQuery({
    queryKey: ["integrations", channel],
    queryFn: () => getIntegrationsHttp({ orgSlug: slug, channelId: channel }),
  });

  const bestMoments = data.pages.flatMap((page) => page.bestMoments);
  const integrations = integrationsData.integrations;

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];

        if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );

    if (loadMoreRef.current) {
      observerRef.current.observe(loadMoreRef.current);
    }

    return () => {
      observerRef.current?.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const isBestMomentsEmpty = bestMoments.length === 0;

  if (isBestMomentsEmpty) {
    return <BestMomentsEmpty />;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {bestMoments.map((bestMoment) => (
          <BestMomentCard
            key={bestMoment.id}
            bestMoment={bestMoment}
            integrations={integrations}
          />
        ))}
      </div>

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center gap-2 py-2 text-muted-foreground text-sm">
              <Spinner className="size-5" />
              Loading more...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
