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
import { ConfirmDisconnectDialog } from "./confirm-disconnect-dialog";

interface ConnectedAccount {
  name: string;
  avatarUrl?: string;
}

interface IntegrationCardProps {
  providerLabel: string;
  providerIcon: React.ReactNode;
  name: string;
  description: string;
  connectedAccount?: ConnectedAccount;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function IntegrationCard({
  providerLabel,
  providerIcon,
  name,
  description,
  connectedAccount,
  onConnect,
  onDisconnect,
}: IntegrationCardProps) {
  const isConnected = !!connectedAccount;
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="h-full">
      <div className="flex h-full flex-col rounded-md border p-5 shadow-sm">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border bg-background p-1.5">
              {providerIcon}
            </div>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
                {providerLabel}
              </p>
              <h3 className="font-semibold leading-tight">{name}</h3>
            </div>
          </div>

          {isConnected && (
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
                  integrationName={name}
                  onConfirm={() => onDisconnect?.()}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {/* Description */}
        <p className="mt-3 text-sm text-muted-foreground">{description}</p>

        <Separator className="my-4" />

        {/* Footer */}
        {isConnected ? (
          <div className="flex items-center justify-between h-full gap-3">
            <div className="flex items-center gap-2">
              <Avatar className="size-6">
                <AvatarImage
                  src={connectedAccount.avatarUrl}
                  alt={connectedAccount.name}
                />
                <AvatarFallback className="text-[10px]">
                  {connectedAccount.name[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">
                {connectedAccount.name}
              </span>
            </div>
            <Badge>Connected</Badge>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={onConnect}>
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
