import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { CodeBlock } from "@/components/code-block";
import { OnThisPage } from "@/components/on-this-page";

export const metadata: Metadata = {
  title: "Mintly | Webhooks",
  description: "Learn about the webhook events Mintly can send to your app.",
};

const tocItems = [
  { id: "introduction", label: "Introduction" },
  { id: "example-payload", label: "Example payload", indent: true },
  { id: "signature-verification", label: "Signature verification" },
  { id: "retries", label: "Retries" },
];

export default function Webhooks() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <p className="text-sm font-semibold text-primary">Webhooks</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">
        Getting started
      </h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Documentation about the Mintly webhooks
      </p>

      <h2
        id="introduction"
        className="mt-10 text-2xl font-bold tracking-tight"
      >
        Introduction
      </h2>
      <p className="mt-4 text-muted-foreground">
        Webhooks are used to receive events from Mintly. You can use webhooks
        to receive events like when a post is created, published, or fails to
        be published.
      </p>
      <p className="mt-4 text-muted-foreground">
        All webhooks are sent using HTTP{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
          POST
        </code>{" "}
        requests.
      </p>

      <h2
        id="example-payload"
        className="mt-10 text-2xl font-bold tracking-tight"
      >
        Example payload
      </h2>
      <p className="mt-4 text-muted-foreground">
        Below you can check an example payload for a{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
          post.posted
        </code>{" "}
        webhook event.
      </p>
      <div className="mt-6">
        <CodeBlock
          code={`{
  "trigger": "post.posted",
  "payload": {
    "title": "My awesome video",
    "description": "Check out this new upload!",
    "tags": ["marketing", "launch"]
  }
}`}
        >
          {"{"}
          {"\n  "}
          <span className="text-sky-300">&quot;trigger&quot;</span>
          {": "}
          <span className="text-orange-300">&quot;post.posted&quot;</span>
          {","}
          {"\n  "}
          <span className="text-sky-300">&quot;payload&quot;</span>
          {": {"}
          {"\n    "}
          <span className="text-sky-300">&quot;title&quot;</span>
          {": "}
          <span className="text-orange-300">
            &quot;My awesome video&quot;
          </span>
          {","}
          {"\n    "}
          <span className="text-sky-300">&quot;description&quot;</span>
          {": "}
          <span className="text-orange-300">
            &quot;Check out this new upload!&quot;
          </span>
          {","}
          {"\n    "}
          <span className="text-sky-300">&quot;tags&quot;</span>
          {": ["}
          <span className="text-orange-300">&quot;marketing&quot;</span>
          {", "}
          <span className="text-orange-300">&quot;launch&quot;</span>
          {"]"}
          {"\n  }"}
          {"\n}"}
        </CodeBlock>
      </div>

      <h2
        id="signature-verification"
        className="mt-10 text-2xl font-bold tracking-tight"
      >
        Signature verification
      </h2>
      <p className="mt-4 text-muted-foreground">
        All webhooks are signed using a HTTP header called{" "}
        <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-sm text-foreground">
          Mintly-Signature
        </code>
        . This header contains a JWT that is signed using the secret key
        present in the webhook list inside the Mintly dashboard.
      </p>
      <div className="mt-6">
        <CodeBlock
          code={`{
  "Mintly-Signature": "eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI8bG9nLWlkPiIsImlzcyI6Im1pbnRseSIsInN1YiI6Imh0dHBzOi8veW91ci1hcHAuY29tL3dlYmhvb2tzIn0.<signature>"
}`}
        >
          {"{"}
          {"\n  "}
          <span className="text-sky-300">&quot;Mintly-Signature&quot;</span>
          {": "}
          <span className="text-orange-300">
            &quot;eyJhbGciOiJIUzI1NiJ9.eyJqdGkiOiI8bG9nLWlkPiIsImlzcyI6Im1pbnRseSIsInN1YiI6Imh0dHBzOi8veW91ci1hcHAuY29tL3dlYmhvb2tzIn0.&lt;signature&gt;&quot;
          </span>
          {"\n}"}
        </CodeBlock>
      </div>

      <h2 id="retries" className="mt-10 text-2xl font-bold tracking-tight">
        Retries
      </h2>
      <p className="mt-4 text-muted-foreground">
        Webhook deliveries are queued and retried automatically, using an
        exponential backoff, whenever your endpoint responds with a non-2xx
        status code. Once the maximum number of attempts is reached, the
        delivery is considered failed and will not be retried again.
      </p>

      <div className="mt-12 flex justify-end">
        <Link
          href="/webhooks/events"
          className="rounded-xl border border-border p-4 text-right hover:border-foreground/20"
        >
          <p className="font-semibold">Events</p>
          <p className="mt-1 flex items-center justify-end gap-1 text-sm text-muted-foreground">
            Next
            <ChevronRight className="size-4" />
          </p>
        </Link>
      </div>

      <OnThisPage items={tocItems} />
    </div>
  );
}
