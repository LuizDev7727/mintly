import { TiktokIcon, YoutubeIcon } from "@/components/provider-icons";
import { dayjs } from "@/lib/dayjs";
import type { BestMoment } from "@/types/best-moment";
import type { Integration } from "@/types/integration";
import { Play } from "lucide-react";

type BestMomentListViewProps = {
  bestMoments: BestMoment[];
  integrations: Integration[];
  onPostBestMoment: (bestMomentId: string, integration: Integration) => void;
};

export function BestMomentListView({
  bestMoments,
  integrations,
  onPostBestMoment,
}: BestMomentListViewProps) {
  return (
    <div className="space-y-2">
      {bestMoments.map((bestMoment) => (
        <div
          key={bestMoment.id}
          className="flex flex-wrap items-center justify-between gap-3 rounded-lg border bg-card p-2 pe-3"
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

          {integrations.length > 0 && (
            <div className="flex shrink-0 flex-wrap items-center gap-1.5">
              {integrations.map((integration) => (
                <button
                  key={integration.id}
                  type="button"
                  onClick={() =>
                    onPostBestMoment(bestMoment.id, integration)
                  }
                  className="cursor-pointer inline-flex max-w-32 items-center gap-1.5 rounded-full border bg-background px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  {integration.provider === "YOUTUBE" ? (
                    <YoutubeIcon className="size-3.5 shrink-0" />
                  ) : (
                    <TiktokIcon className="size-3 shrink-0" />
                  )}
                  <span className="truncate">{integration.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
