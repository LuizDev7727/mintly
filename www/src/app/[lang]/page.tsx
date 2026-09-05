import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Features } from "./(home)/components/features";

export const metadata: Metadata = {
  title: "Home | Mintly",
  description:
    "Mintly connects your channels, organizes your content, and tracks growth — all in one place.",
};

export default async function Home() {

  return (
    <div className="w-full">
      <main className="mx-auto w-full z-0 relative">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            Schedule, publish, and track your content across every channel
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            Mintly connects your channels, organizes your content, and tracks
            growth — all in one place.
          </p>

          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              Get started for free
              <ArrowRight />
            </Link>
          </Button>
        </section>

        <Features/>

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-16 text-center">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              Ready to bring your content workflow together?
            </h2>
            <p className="max-w-md text-zinc-800">
              Create your free account and start scheduling in minutes.
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">
                Create your account
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
