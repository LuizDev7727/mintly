import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface WebhookSigningSecretDialogProps {
  endpointUrl: string | null
  secret: string | null
  onOpenChange: (open: boolean) => void
}

export function WebhookSigningSecretDialog({
  endpointUrl,
  secret,
  onOpenChange,
}: WebhookSigningSecretDialogProps) {
  const [visible, setVisible] = useState(false)

  const masked = secret
    ? `${secret.slice(0, 10)}${"•".repeat(20)}${secret.slice(-4)}`
    : ""

  return (
    <Dialog
      open={!!secret}
      onOpenChange={(open) => {
        if (!open) setVisible(false)
        onOpenChange(open)
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Signing Secret</DialogTitle>
          <DialogDescription>
            Use this secret to verify that webhook events sent to{" "}
            <span className="font-mono text-foreground">{endpointUrl}</span>{" "}
            actually came from Mintly.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center gap-2">
          <code className="flex-1 truncate rounded-md border bg-muted/50 px-3 py-2 font-mono text-sm">
            {visible ? secret : masked}
          </code>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setVisible((prev) => !prev)}
            aria-label={visible ? "Hide signing secret" : "Reveal signing secret"}
          >
            {visible ? <EyeOff /> : <Eye />}
          </Button>
          <CopyButton value={secret ?? ""} />
        </div>

        <p className="text-xs text-muted-foreground">
          Every request includes a{" "}
          <code className="rounded bg-muted px-1 py-0.5">
            Mintly-Signature
          </code>{" "}
          header, an HMAC SHA-256 hash of the payload signed with this
          secret.
        </p>
      </DialogContent>
    </Dialog>
  )
}
