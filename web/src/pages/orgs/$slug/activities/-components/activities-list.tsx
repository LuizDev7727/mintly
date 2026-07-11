import { useEffect, useRef } from "react";
import { useParams } from "@tanstack/react-router";
import { useSuspenseInfiniteQuery } from "@tanstack/react-query";
import { Timeline } from "@/components/ui/timeline";
import { Spinner } from "@/components/ui/spinner";
import { getActivitiesHttp } from "@/http/activity/get-activities.http";
import { ActivityCard } from "./activity-card";
import { ActivitiesListEmpty } from "./activities-list-empty";

export function ActivitiesList() {
  const { slug } = useParams({ from: "/orgs/$slug/activities/" });

  const loadMoreRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const { data, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useSuspenseInfiniteQuery({
      queryKey: ["activities", slug],
      queryFn: ({ pageParam }) =>
        getActivitiesHttp({ orgSlug: slug, cursor: pageParam }),
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      initialPageParam: undefined as string | undefined,
    });

  const activities = data.pages.flatMap((page) => page.activities);

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


  const isActivitiesEmpty = activities.length === 0;

  if (isActivitiesEmpty) {
    return <ActivitiesListEmpty />;
  }

  return (
    <div>
      <Timeline>
        {activities.map((activity, index) => (
          <ActivityCard key={activity.id} index={index} activity={activity} />
        ))}
      </Timeline>

      {hasNextPage && (
        <div className="p-2" ref={loadMoreRef}>
          {isFetchingNextPage && (
            <div className="flex items-center justify-center py-2">
              <Spinner className="size-5" />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
