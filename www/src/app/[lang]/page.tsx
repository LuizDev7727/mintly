import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Features } from "./(home)/components/features";
import { getDictionary } from "./dictionaries";

export const metadata: Metadata = {
  title: "Home | Mintly",
  description:
    "Mintly connects your channels, organizes your content, and tracks growth — all in one place.",
};

export default async function Home() {
  const dict = await getDictionary()

  return (
    <div className="w-full">
      <main className="mx-auto w-full z-0 relative">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            {dict.home.hero.title}
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            {dict.home.hero.subtitle}
          </p>

          <Button size="lg" asChild>
            <Link href="/auth/sign-up">
              {dict.home.hero.cta}
              <ArrowRight />
            </Link>
          </Button>
        </section>

        <Features dict={dict.features} />

        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-16 text-center">
            <h2 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
              {dict.home.ctaSection.title}
            </h2>
            <p className="max-w-md text-zinc-800">
              {dict.home.ctaSection.subtitle}
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/auth/sign-up">
                {dict.home.ctaSection.cta}
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
