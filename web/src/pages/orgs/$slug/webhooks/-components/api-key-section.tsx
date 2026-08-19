import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CopyButton } from "@/components/ui/copy-button"
import { RegenerateApiKeyDialog } from "./regenerate-api-key-dialog"

interface ApiKeySectionProps {
  apiKey: string | null
}

export function ApiKeySection({ apiKey }: ApiKeySectionProps) {
  const [visible, setVisible] = useState(false)

  const maskedApiKey = apiKey
    ? `${apiKey.slice(0, 12)}${"•".repeat(16)}${apiKey.slice(-4)}`
    : ""

  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2">
        <h3 className="text-sm font-medium">API Key</h3>
        <Badge variant="secondary">Production</Badge>
      </div>

      {apiKey ? (
        <>
          <div className="flex items-center gap-1.5">
            <code className="flex-1 truncate rounded-md border bg-muted/50 px-2.5 py-1.5 font-mono text-xs">
              {visible ? apiKey : maskedApiKey}
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

          <div className="flex gap-2 pt-1">
            <CopyButton
              value={apiKey}
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
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-md border border-dashed p-4 text-center">
          <p className="text-xs text-muted-foreground">
            No API key generated for this organization yet.
          </p>
          <RegenerateApiKeyDialog
            triggerLabel="Generate Key"
            variant="default"
          />
        </div>
      )}
    </div>
  )
}
