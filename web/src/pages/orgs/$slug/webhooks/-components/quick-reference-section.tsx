import { CopyButton } from "@/components/ui/copy-button"

const CURL_LINES = [
  "curl https://api.mintly.com/v1/projects \\",
  '  -H "Authorization: Bearer live_just_testing" \\',
  '  -H "Content-Type: application/json" \\',
  "  -d '{\"name\": \"My Project\"}'",
]
const CURL_EXAMPLE = CURL_LINES.join("\n")

export function QuickReferenceSection() {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-medium">Quick Reference</h2>
          <p className="text-xs text-muted-foreground">
            Example request authenticated with your API key.
          </p>
        </div>
        <CopyButton value={CURL_EXAMPLE} size="sm">
          Copy
        </CopyButton>
      </div>

      <div className="overflow-x-auto rounded-md border bg-muted/50">
        <pre className="p-3 font-mono text-xs leading-relaxed">
          <code>
            {CURL_LINES.map((line, index) => (
              <div key={index} className="flex gap-3">
                <span className="w-4 shrink-0 select-none text-right text-muted-foreground/50">
                  {index + 1}
                </span>
                <span className="whitespace-pre">{line}</span>
              </div>
            ))}
          </code>
        </pre>
      </div>
    </div>
  )
}
