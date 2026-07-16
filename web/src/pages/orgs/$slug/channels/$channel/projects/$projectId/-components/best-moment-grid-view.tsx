import { dayjs } from "@/lib/dayjs";
import type { BestMoment } from "@/types/best-moment";

type BestMomentGridViewProps = {
  bestMoments: BestMoment[];
};

export function BestMomentGridView({ bestMoments }: BestMomentGridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
      {bestMoments.map((bestMoment) => (
        <div
          key={bestMoment.id}
          className="group overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md"
        >
          <div className="relative aspect-9/16 w-full overflow-hidden bg-muted">
            <video
              src={bestMoment.url}
              controls
              preload="metadata"
              className="size-full object-cover"
            />
          </div>

          <div className="flex items-start justify-between gap-2 p-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                {bestMoment.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {dayjs(bestMoment.createdAt).format("MMM D, YYYY")}
              </p>
            </div>

          </div>
        </div>
      ))}
    </div>
  );
}
