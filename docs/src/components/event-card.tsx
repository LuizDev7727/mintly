"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type EventTab = "Types" | "Example" | "zod";

type EventCardProps = {
  types: { code: string; content: ReactNode };
  example: { code: string; content: ReactNode };
  zodSchema: { code: string; content: ReactNode };
};

export function EventCard({ types, example, zodSchema }: EventCardProps) {
  const [tab, setTab] = useState<EventTab>("Types");
  const [copied, setCopied] = useState(false);

  const tabs: Record<EventTab, { code: string; content: ReactNode }> = {
    Types: types,
    Example: example,
    zod: zodSchema,
  };

  async function handleCopy() {
    await navigator.clipboard.writeText(tabs[tab].code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 rounded-lg bg-muted p-1 text-xs">
          {(Object.keys(tabs) as EventTab[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`rounded-md px-2.5 py-1 ${
                tab === key
                  ? "bg-background text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {key}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy"
          className="text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>

      <pre className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed">
        {tabs[tab].content}
      </pre>
    </div>
  );
}
