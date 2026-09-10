import Link from "next/link";
import { Code2, Webhook } from "lucide-react";

export default function Home() {
  return (
    <div className="mx-auto max-w-3xl p-4">
      <p className="text-sm font-semibold text-primary">Get Started</p>
      <h1 className="mt-1 text-4xl font-bold tracking-tight">Introduction</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        Welcome to the home of your new documentation
      </p>

      <p className="mt-8 text-muted-foreground">
        Documentation from Mintly HTTP API and Webhooks.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Link
          href="/api-reference"
          className="rounded-xl border border-border bg-card p-6 hover:border-foreground/20"
        >
          <Code2 className="size-6 text-primary" />
          <h2 className="mt-4 font-semibold">API Reference</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Documentation for the Mintly HTTP API
          </p>
        </Link>

        <Link
          href="/webhooks"
          className="rounded-xl border border-border bg-card p-6 hover:border-foreground/20"
        >
          <Webhook className="size-6 text-primary" />
          <h2 className="mt-4 font-semibold">Webhooks</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Documentation for the Mintly Webhooks
          </p>
        </Link>
      </div>
    </div>
  );
}
