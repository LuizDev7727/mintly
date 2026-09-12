import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

type CTAFinalDict = {
  title: string;
  subtitle: string;
  cta: string;
};

type CTAFinalProps = {
  dict: CTAFinalDict;
};

export function CTAFinal({ dict }: CTAFinalProps) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <div className="flex flex-col items-center gap-6 rounded-2xl bg-primary px-8 py-16 text-center">
        <h2 className="max-w-xl text-3xl font-bold tracking-tight text-zinc-900 md:text-4xl">
          {dict.title}
        </h2>
        <p className="max-w-md text-zinc-800">{dict.subtitle}</p>
        <Button size="lg" variant="secondary" asChild>
          <Link href="/auth/sign-up">
            {dict.cta}
            <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
