"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Check, ChevronDown, Copy, Terminal } from "lucide-react";

type RequestExampleProps = {
  title: string;
  code: string;
  children: ReactNode;
};

export function RequestExample({ title, code, children }: RequestExampleProps) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold">{title}</p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <Terminal className="size-3.5" />
            cURL
            <ChevronDown className="size-3.5" />
          </button>
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy request example"
            className="text-muted-foreground hover:text-foreground"
          >
            {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
          </button>
        </div>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-sm leading-relaxed">
        {children}
      </pre>
    </div>
  );
}
