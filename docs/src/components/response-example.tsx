"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";

type StatusExample = {
  status: string;
  code: string;
  content: ReactNode;
};

type ResponseExampleProps = {
  examples: StatusExample[];
};

export function ResponseExample({ examples }: ResponseExampleProps) {
  const [active, setActive] = useState(examples[0].status);
  const [copied, setCopied] = useState(false);

  const current = examples.find((example) => example.status === active) ?? examples[0];

  async function handleCopy() {
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-4 overflow-x-auto">
          {examples.map((example) => (
            <button
              key={example.status}
              type="button"
              onClick={() => setActive(example.status)}
              className={`-mb-3 shrink-0 border-b-2 pb-3 text-sm ${
                active === example.status
                  ? "border-primary font-medium text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {example.status}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={handleCopy}
          aria-label="Copy response example"
          className="shrink-0 text-muted-foreground hover:text-foreground"
        >
          {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
        </button>
      </div>

      <pre className="mt-4 overflow-x-auto font-mono text-sm leading-relaxed">
        {current.content}
      </pre>
    </div>
  );
}
