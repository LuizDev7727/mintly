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
import { ConfirmDisconnectDialog } from "./confirm-disconnect-dialog";
import { TiktokIcon } from "./provider-icons";
import { deleteIntegrationHttp } from "@/http/integration/delete-ingration.http";
import type { Integration } from "@/types/integration";

interface TiktokIntegrationCardProps {
  integration: Integration | undefined;
}

export function TiktokIntegrationCard({
  integration,
}: TiktokIntegrationCardProps) {
  const queryClient = useQueryClient();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { mutateAsync: deleteIntegration } = useMutation({
    mutationFn: deleteIntegrationHttp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["integrations"] });
    },
  });

  async function handleConnect() {}

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-md border p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background p-1.5">
              <TiktokIcon />
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                TikTok
              </p>
              <h3 className="font-semibold leading-tight">TikTok</h3>
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
                  integrationName="TikTok"
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
          Connect your TikTok account to publish clips and reach your
          audience directly from Mintly.
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
          <Button variant="outline" className="w-full" disabled={true} onClick={handleConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
