import { TiktokIcon, YoutubeIcon } from "@/components/provider-icons";
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sendBestMomentToSocialMediaHttp } from "@/http/best-moments/send-best-moment-to-social-media.http";
import { dayjs } from "@/lib/dayjs";
import type { BestMoment } from "@/types/best-moment";
import type { Integration } from "@/types/integration";
import { useMutation } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Send } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DATETIME_LOCAL_FORMAT = "YYYY-MM-DDTHH:mm";

type BestMomentCardProps = {
  bestMoment: BestMoment;
  integrations: Integration[];
};

export function BestMomentCard({
  bestMoment,
  integrations,
}: BestMomentCardProps) {

  const [scheduleTo, setScheduleTo] = useState<string | null>(null)
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null)

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel/projects/$projectId/",
  });

  const {
    mutateAsync: sendBestMomentToSocialMedia,
    isPending
  } = useMutation({
    mutationFn: sendBestMomentToSocialMediaHttp,
    onSuccess: () => {
      toast(`Starting to upload to social media`);
    },
  });

  async function handlePostBestMoment(integration: Integration) {
    await sendBestMomentToSocialMedia({
      orgSlug: slug,
      bestMomentId: bestMoment.id,
      channelId: channel,
      integrationId: integration.id,
      scheduledTo: scheduleTo
    });
  }

  const hasIntegrations = integrations.length > 0;
  const hasTags = bestMoment.tags.length > 0;
  const isScheduled = scheduleTo !== null;
  // Sem escolha do usuário, vale a primeira integração (só renderizado quando há ao menos uma).
  const selectedIntegration =
    integrations.find((integration) => integration.id === selectedIntegrationId) ??
    integrations[0];

  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-card transition-shadow hover:shadow-md">
      <div className="relative aspect-9/16 w-full overflow-hidden bg-muted">
        <video
          src={bestMoment.url}
          controls
          preload="metadata"
          className="size-full object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3">
        <div className="min-w-0">
          <h3 className="line-clamp-2 text-sm font-medium leading-snug">
            {bestMoment.title}
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            {dayjs(bestMoment.createdAt).format("MMM D, YYYY")}
          </p>
        </div>

        {bestMoment.description ? (
          <p className="line-clamp-3 text-xs text-muted-foreground">
            {bestMoment.description}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No description</p>
        )}

        {hasTags ? (
          <div className="flex flex-wrap gap-1.5">
            {bestMoment.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">No tags</p>
        )}


        {
          hasIntegrations && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="mt-auto w-full">
                  <Send />
                  Publish
                </Button>
              </PopoverTrigger>
              <PopoverContent>
                <PopoverHeader>
                  <PopoverTitle>Publish this clip</PopoverTitle>
                  <PopoverDescription>
                    Post it now, or pick a date and time to schedule it.
                  </PopoverDescription>
                </PopoverHeader>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Post to</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {integrations.map((integration) => (
                        <button
                          key={integration.id}
                          type="button"
                          aria-pressed={integration.id === selectedIntegration.id}
                          data-selected={integration.id === selectedIntegration.id}
                          onClick={() => setSelectedIntegrationId(integration.id)}
                          className="inline-flex max-w-full cursor-pointer items-center gap-1.5 rounded-full border bg-background px-2 py-1 text-xs transition-colors hover:bg-accent hover:text-accent-foreground data-[selected=true]:border-primary data-[selected=true]:bg-accent"
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
                  </div>

                  <Label htmlFor={`schedule-to-${bestMoment.id}`}>Schedule To</Label>
                  <Input
                    id={`schedule-to-${bestMoment.id}`}
                    type="datetime-local"
                    min={dayjs().format(DATETIME_LOCAL_FORMAT)}
                    value={scheduleTo ? dayjs(scheduleTo).format(DATETIME_LOCAL_FORMAT) : ""}
                    onChange={(event) => {
                      const { value } = event.target;
                      // O input entrega a data no fuso do usuário e sem fuso na string;
                      // convertemos aqui para ISO (UTC) antes de ir para o estado.
                      setScheduleTo(value ? new Date(value).toISOString() : null);
                    }}
                  />
                  <p className="text-xs text-muted-foreground">
                    {isScheduled
                      ? `Will be posted on ${dayjs(scheduleTo).format("MMM D, YYYY [at] HH:mm")}.`
                      : "No date selected: it will be posted now."}
                  </p>
                  <Button
                    variant={'outline'}
                    size={'sm'}
                    disabled={isPending}
                    onClick={() => handlePostBestMoment(selectedIntegration)}
                  >
                    {isScheduled ? "Schedule Reels" : "Publish Reels now"}
                    {isPending && "Publishing reels.."}
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
          )
        }
      </div>
    </div>
  );
}
