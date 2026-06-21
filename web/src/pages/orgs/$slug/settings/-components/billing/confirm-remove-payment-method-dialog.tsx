import { Trash } from "lucide-react";
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

interface ConfirmRemovePaymentMethodDialogProps {
  last4: string;
  onConfirm?: () => void;
}

export function ConfirmRemovePaymentMethodDialog({
  last4,
  onConfirm,
}: ConfirmRemovePaymentMethodDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <button className="text-xs text-destructive transition-colors hover:text-destructive/80">
          Remove
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove payment method</DialogTitle>
          <DialogDescription>
            Are you sure you want to remove the card ending in {last4}? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button variant="destructive" onClick={onConfirm}>
            <Trash className="size-4" />
            Remove card
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
