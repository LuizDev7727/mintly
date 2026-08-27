import { YoutubeIcon, TiktokIcon, InstagramIcon } from "@/components/provider-icons";
import type { Integration } from "@/types/integration";

const providerConfig: Record<
  Integration["provider"],
  { label: string; icon: typeof YoutubeIcon }
> = {
  YOUTUBE: { label: "Youtube", icon: YoutubeIcon },
  TIKTOK: { label: "TikTok", icon: TiktokIcon },
  INSTAGRAM: { label: "Instagram", icon: InstagramIcon },
};


type IntegrationsProps = {
  integrations: Integration[];
};

export function Integrations({ integrations }: IntegrationsProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border dark:bg-zinc-900/20 p-5">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Integrations</h3>
        <span className="text-xs text-muted-foreground">View all</span>
      </div>

      <div className="flex flex-col gap-2">
        {integrations.map((integration) => {
          const { label, icon: Icon } = providerConfig[integration.provider];

          return (
            <div key={integration.id} className="flex items-center gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-background p-1.5">
                <Icon className="size-full" />
              </div>
              <span className="text-sm font-medium">{label}</span>
              <span className="ml-auto truncate text-xs text-muted-foreground">
                {integration.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
