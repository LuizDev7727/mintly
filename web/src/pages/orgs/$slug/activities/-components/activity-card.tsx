import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "@/components/ui/timeline";
import type { Activity } from "@/types/activity"
import { getInitials } from "@/utils/get-initials";
import { dayjs } from "@/lib/dayjs";
import { ACTIVITY_ACTION_CONFIG } from "./activity-action-config";

type ActivityCardProps = {
  index: number
  activity: Activity
}

export function ActivityCard({ index, activity }: ActivityCardProps) {
  const { label, icon: ActionIcon } = ACTIVITY_ACTION_CONFIG[activity.action];

  return (
    <TimelineItem
      className="group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-8"
      step={index}
    >
      <TimelineHeader>
        <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
        <TimelineTitle className="mt-0.5 flex flex-wrap items-center gap-1.5">
          {activity.author.name}
          <span className="inline-flex items-center gap-1 font-normal text-muted-foreground text-sm">
            <ActionIcon className="size-3.5" />
            {label}
          </span>
        </TimelineTitle>
        <TimelineIndicator className="group-data-[orientation=vertical]/timeline:-left-7 flex size-6 items-center justify-center border-none bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground">
          <Avatar className="size-6">
            {
              activity.author.avatarUrl && (
                <AvatarImage src={activity.author.avatarUrl} alt={activity.author.name} />
              )
            }
            <AvatarFallback>{getInitials(activity.author.name)}</AvatarFallback>
          </Avatar>
        </TimelineIndicator>
      </TimelineHeader>
      <TimelineContent className="mt-2 rounded-lg border px-4 py-3 text-foreground">
        {activity.description}
        <TimelineDate className="mt-1 mb-0">
          {dayjs(activity.createdAt).fromNow()}
        </TimelineDate>
      </TimelineContent>
    </TimelineItem>
  )
}
