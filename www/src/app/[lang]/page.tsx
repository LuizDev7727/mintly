import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CTAFinal } from "./(home)/components/cta-final";
import { FAQ } from "./(home)/components/faq";
import { Features } from "./(home)/components/features";
import { Pricing } from "./(home)/components/pricing";
import { getDictionary } from "./dictionaries";
import { captureEvent, getFeatureFlag } from "@/lib/analytics";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();

  return {
    title: dict.home.meta.title,
    description: dict.home.meta.description,
  };
}

export default async function Home() {
  const dict = await getDictionary();

  const heroVariant = await getFeatureFlag("hero-copy-variant");
  const heroTitle =
    heroVariant === "variant-b"
      ? dict.home.hero.titleVariantB
      : dict.home.hero.title;

  await captureEvent({
    event: "landing_page_viewed",
    properties: { hero_variant: heroVariant ?? "control" },
  });

  return (
    <div className="w-full">
      <main className="mx-auto w-full z-0 relative">
        <section className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-6 py-24 text-center">
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-balance md:text-6xl">
            {heroTitle}
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

        <Features dict={dict.home.features} />

        <Pricing dict={dict.home.pricing} />

        <FAQ dict={dict.home.faq} />

        <CTAFinal dict={dict.home.ctaFinal} />
      </main>
    </div>
  );
}
