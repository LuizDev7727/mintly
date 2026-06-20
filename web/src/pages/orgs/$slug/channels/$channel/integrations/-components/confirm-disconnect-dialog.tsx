import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Unlink } from "lucide-react";

interface ConfirmDisconnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  integrationName: string;
  onConfirm: () => void;
}

export function ConfirmDisconnectDialog({
  open,
  onOpenChange,
  integrationName,
  onConfirm,
}: ConfirmDisconnectDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <Unlink className="size-4" />
          Disconnect
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Disconnect {integrationName}?</DialogTitle>
          <DialogDescription>
            Your {integrationName} account will be disconnected from Mintly. You
            can reconnect it at any time.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            Disconnect
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
