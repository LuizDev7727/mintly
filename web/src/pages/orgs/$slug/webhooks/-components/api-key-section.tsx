import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { RegenerateApiKeyDialog } from "./regenerate-api-key-dialog"

const API_KEY = "live_just_testing"
const MASKED_API_KEY = `${API_KEY.slice(0, 12)}${"•".repeat(16)}${API_KEY.slice(-4)}`

export function ApiKeySection() {
  const [visible, setVisible] = useState(false)

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">API Key</h3>
        <Badge variant="secondary">Production</Badge>
      </div>

      <div className="flex items-center gap-1.5">
        <code className="flex-1 truncate rounded-md border bg-muted/50 px-2.5 py-1.5 font-mono text-xs">
          {visible ? API_KEY : MASKED_API_KEY}
        </code>
        <Button
          type="button"
          variant="outline"
          size="icon-sm"
          onClick={() => setVisible((prev) => !prev)}
          aria-label={visible ? "Hide API key" : "Reveal API key"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2 text-xs">
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Created</p>
          <p className="font-medium text-foreground">Jan 12, 2026</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Last Used</p>
          <p className="font-medium text-foreground">2 hours ago</p>
        </div>
        <div className="space-y-0.5">
          <p className="text-muted-foreground">Permissions</p>
          <p className="font-medium text-foreground">Full Access</p>
        </div>
      </div>

      <div className="flex gap-2 pt-1">
        <CopyButton
          value={API_KEY}
          variant="default"
          size="sm"
          className="flex-1 justify-center"
        >
          Copy Key
        </CopyButton>
        <RegenerateApiKeyDialog
          triggerLabel="Regenerate Key"
          className="flex-1 justify-center"
        />
      </div>
    </div>
  )
}
