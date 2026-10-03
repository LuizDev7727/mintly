import { dayjs } from "@/lib/dayjs";
import { Play } from "lucide-react";

type BestMomentCardProps = {
  bestMoment: {
    id: string;
    title: string;
    createdAt: string;
  };
};

export function BestMomentCard({ bestMoment }: BestMomentCardProps) {
  return (
    <article className="group flex flex-col gap-3 rounded-xl border border-border/60 bg-linear-to-br from-foreground/4 to-transparent p-3 transition-colors hover:border-primary/40 dark:bg-zinc-900/20">
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden rounded-lg bg-muted text-muted-foreground">
        <Play
          className="size-6 transition-colors group-hover:text-primary"
          strokeWidth={1.5}
        />
      </div>

      <div className="min-w-0 space-y-0.5">
        <p className="line-clamp-2 text-sm font-medium">{bestMoment.title}</p>
        <p className="text-xs text-muted-foreground">
          {dayjs(bestMoment.createdAt).format("MMM D, YYYY")}
        </p>
      </div>
    </article>
  );
}
