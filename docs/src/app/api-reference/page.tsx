import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";

export const metadata: Metadata = {
  title: "Mintly | API Reference",
  description: "Reference documentation for the Mintly API endpoints.",
};

export default function ApiReference() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <p className="text-sm font-semibold text-primary">API Reference</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Introduction</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Documentation about the Mintly API endpoints
      </p>

      <h2 className="mt-10 text-2xl font-bold tracking-tight">
        Authentication
      </h2>
      <p className="mt-4 text-muted-foreground">
        All public API endpoints are authenticated using API keys that must
        be provided by using the{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
          Authorization
        </code>{" "}
        header. Available operations include listing the projects created
        within a channel.
      </p>
      <p className="mt-4 text-muted-foreground">
        You can get your API key from the Mintly dashboard inside account
        settings.
      </p>

      <div className="mt-6">
        <CodeBlock
          code={`"headers": {\n  "Authorization": "<your-api-key>"\n}`}
        >
          <span className="text-orange-300">&quot;headers&quot;</span>
          {": {"}
          {"\n  "}
          <span className="text-sky-300">&quot;Authorization&quot;</span>
          {": "}
          <span className="text-orange-300">
            &quot;&lt;your-api-key&gt;&quot;
          </span>
          {"\n}"}
        </CodeBlock>
      </div>

      <div className="mt-12 flex justify-end">
        <Link
          href="/api-reference/get-projects"
          className="rounded-xl border border-border p-4 text-right hover:border-foreground/20"
        >
          <p className="font-semibold">Get Projects</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
            Next
            <ChevronRight className="size-4" />
          </p>
        </Link>
      </div>
    </div>
  );
}
