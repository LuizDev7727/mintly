import { TiktokIcon, YoutubeIcon } from "@/components/provider-icons";
import { dayjs } from "@/lib/dayjs";
import type { BestMoment } from "@/types/best-moment";
import type { Integration } from "@/types/integration";

type BestMomentGridViewProps = {
  bestMoments: BestMoment[];
  integrations: Integration[];
  onPostBestMoment: (bestMomentId: string, integration: Integration) => void;
};

export function BestMomentGridView({
  bestMoments,
  integrations,
  onPostBestMoment,
}: BestMomentGridViewProps) {
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

          <div className="space-y-2 p-3">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-medium leading-snug">
                {bestMoment.title}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                {dayjs(bestMoment.createdAt).format("MMM D, YYYY")}
              </p>
            </div>

            {integrations.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5">
                {integrations.map((integration) => (
                  <button
                    key={integration.id}
                    type="button"
                    onClick={() =>
                      onPostBestMoment(bestMoment.id, integration)
                    }
                    className="cursor-pointer inline-flex max-w-full items-center gap-1.5 rounded-full border bg-background px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground"
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
        </div>
      ))}
    </div>
  );
}
