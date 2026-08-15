import { KeyRound } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface RegenerateApiKeyDialogProps {
  triggerLabel: string
  variant?: React.ComponentProps<typeof Button>["variant"]
  size?: React.ComponentProps<typeof Button>["size"]
  className?: string
}

export function RegenerateApiKeyDialog({
  triggerLabel,
  variant = "outline",
  size = "sm",
  className,
}: RegenerateApiKeyDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <KeyRound className="size-4" />
          {triggerLabel}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Regenerate API Key</DialogTitle>
          <DialogDescription>
            This will invalidate your current key immediately. Any
            integration using it will stop working until you update it with
            the new key. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter showCloseButton>
          <Button variant="destructive">
            <KeyRound className="size-4" />
            Regenerate Key
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
