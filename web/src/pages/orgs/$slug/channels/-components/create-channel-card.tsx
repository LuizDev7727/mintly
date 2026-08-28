import { CreateChannelDialog } from "@/components/create-channel-dialog";
import { TvMinimal } from "lucide-react";

export function CreateChannelCard() {
  return (
    <div className="flex h-full w-full min-w-0 flex-col justify-between gap-3 rounded-lg border border-border p-5">
      <div className="flex flex-col gap-3">
        <TvMinimal className="size-5 text-muted-foreground" />

        <div>
          <h3 className="text-[15px] font-semibold leading-[1.3]">
            Create channel
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Set default AI, security and automation settings per channel.
          </p>
        </div>
      </div>

      <CreateChannelDialog />
    </div>
  );
}
