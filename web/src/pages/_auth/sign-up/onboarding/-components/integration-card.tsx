import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { ReactNode } from "react";

type IntegrationCardState =
  | "default"
  | "connecting"
  | "connected"
  | "coming-soon";

type IntegrationCardProps = {
  name: string;
  icon: ReactNode;
  state: IntegrationCardState;
  onConnect?: () => void;
};

export function IntegrationCard({
  name,
  icon,
  state,
  onConnect,
}: IntegrationCardProps) {
  return (
    <div
      data-state={state}
      className="flex items-center gap-3 rounded-lg border p-4 data-[state=coming-soon]:opacity-60 data-[state=connected]:border-emerald-500/50"
    >
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{name}</p>
        {state === "connecting" && (
          <p className="text-xs text-muted-foreground">Check the new tab</p>
        )}
      </div>
      {state === "default" && (
        <Button type="button" size="sm" onClick={onConnect}>
          Connect
        </Button>
      )}
      {state === "connecting" && (
        <Button type="button" size="sm" disabled>
          <Spinner />
          Connecting
        </Button>
      )}
      {state === "connected" && <Badge variant="success">Connected</Badge>}
      {state === "coming-soon" && <Badge variant="canceled">Coming soon</Badge>}
    </div>
  );
}
