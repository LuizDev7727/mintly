import { Spinner } from "@/components/ui/spinner";
import { useViewMode } from "@/context/view-mode-context";
import { getBestMomentsHttp } from "@/http/best-moments/get-best-moments.http";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { BestMomentsEmpty } from "./best-moments-empty";
import { BestMomentGridView } from "./best-moment-grid-view";
import { BestMomentListView } from "./best-moment-list-view";
import { useParams } from "@tanstack/react-router";

export function BestMoments() {

  const { projectId } = useParams({
    from:"/orgs/$slug/channels/$channel/projects/$projectId/"
  })

  const { view } = useViewMode();

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["best-moments", projectId],
      queryFn: ({ pageParam }) =>
        getBestMomentsHttp({
          projectId,
          cursor: pageParam,
        }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
    });

  const bestMoments = data.pages.flatMap((page) => page.bestMoments);

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
      {view === "grid" && <BestMomentGridView bestMoments={bestMoments} />}
      {view === "list" && <BestMomentListView bestMoments={bestMoments} />}

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
