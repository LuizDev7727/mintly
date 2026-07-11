import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ConfirmDisconnectDialog } from "./confirm-disconnect-dialog";
import { YoutubeIcon } from "./provider-icons";
import { deleteIntegrationHttp } from "@/http/integration/delete-ingration.http";
import { requestYoutubeIntegrationUrlHttp } from "@/http/integration/request-youtube-integration-url.http";
import type { Integration } from "@/types/integration";

interface YoutubeIntegrationCardProps {
  integration: Integration | undefined;
}

export function YoutubeIntegrationCard({
  integration,
}: YoutubeIntegrationCardProps) {
  const { channel } = useParams({ from: "/orgs/$slug/channels/$channel" });
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutateAsync: deleteIntegration } = useMutation({
    mutationFn: deleteIntegrationHttp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  async function handleConnect() {
    const { url } = await requestYoutubeIntegrationUrlHttp({
      channelId: channel,
    });
    window.location.href = url;
  }

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-md border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background p-1.5">
              <YoutubeIcon />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                Google
              </p>
              <h3 className="font-semibold leading-tight">YouTube</h3>
            </div>
          </div>

          {integration && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-8 shrink-0 bg-transparent!"
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <ConfirmDisconnectDialog
                  open={confirmOpen}
                  onOpenChange={setConfirmOpen}
                  integrationName="YouTube"
                  onConfirm={async () => {
                    await deleteIntegration({
                      integrationId: integration.id,
                    });
                  }}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Connect your YouTube channel to publish Shorts and manage your video
          content directly from Mintly.
        </p>

        <Separator className="my-4" />

        {integration ? (
          <div className="flex h-full items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={integration.avatarUrl ?? undefined}
                  alt={integration.name}
                />
                <AvatarFallback className="text-[10px]">
                  {integration.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{integration.name}</span>
            </div>
            <Badge>Connected</Badge>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={handleConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
