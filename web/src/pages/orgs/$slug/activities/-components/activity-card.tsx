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


type ActivityCardProps = {
  index: number
  activity: Activity
}

export function ActivityCard({ index, activity }: ActivityCardProps) {
  return (
    <TimelineItem
      className="group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-8"
      step={index}
    >
      <TimelineHeader>
        <TimelineSeparator className="group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5" />
        <TimelineTitle className="mt-0.5">
          {activity.author.name}{" "}
          <span className="font-normal text-muted-foreground text-sm">
            {activity.action}
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
        <TimelineDate className="mt-1 mb-0">{dayjs(activity.createdAt).fromNow()}</TimelineDate>
      </TimelineContent>
    </TimelineItem>
  )
}
