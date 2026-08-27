import { Link, useParams } from "@tanstack/react-router";
import { Timeline } from "@/components/ui/timeline";
import type { Activity } from "@/types/activity";
import { ActivityCard } from "@/pages/orgs/$slug/activities/-components/activity-card";

export type ActivitiesProps = {
  activities: Activity[];
}

export function Activities({ activities }: ActivitiesProps) {
  const { slug } = useParams({ from: "/orgs/$slug" });

  return (
    <div className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Recent activities</h3>
        <Link
          to="/orgs/$slug/activities"
          params={{ slug }}
          className="text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          View all
        </Link>
      </div>

      <Timeline>
        {activities.map((activity, index) => (
          <ActivityCard key={activity.id} index={index} activity={activity} />
        ))}
      </Timeline>
    </div>
  );
}
