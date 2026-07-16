import { dayjs } from "@/lib/dayjs";
import type { BestMoment } from "@/types/best-moment";
import { Play } from "lucide-react";

type BestMomentListViewProps = {
  bestMoments: BestMoment[];
};

export function BestMomentListView({ bestMoments }: BestMomentListViewProps) {
  return (
    <div className="space-y-2">
      {bestMoments.map((bestMoment) => (
        <div
          key={bestMoment.id}
          className="flex items-center justify-between gap-3 rounded-lg border bg-card p-2 pe-3"
        >
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative aspect-9/16 h-14 shrink-0 overflow-hidden rounded bg-muted">
              <video
                src={bestMoment.url}
                muted
                playsInline
                preload="metadata"
                className="size-full object-cover"
              />
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/20">
                <Play className="size-4 fill-white text-white" />
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-0.5">
              <p className="truncate font-medium text-[13px]">
                {bestMoment.title}
              </p>
              <p className="text-muted-foreground text-xs">
                {dayjs(bestMoment.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
          </div>

        </div>
      ))}
    </div>
  );
}
