import { Check } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type PricingDict = {
  title: string;
  subtitle: string;
  planTitle: string;
  planDescription: string;
  included: string[];
  cta: string;
  note: string;
};

type PricingProps = {
  dict: PricingDict;
};

export function Pricing({ dict }: PricingProps) {
  return (
    <section className="border-t border-border py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
          <p className="mt-3 text-muted-foreground">{dict.subtitle}</p>
        </div>

        <Card className="mx-auto max-w-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-lg">{dict.planTitle}</CardTitle>
            <CardDescription>{dict.planDescription}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="flex flex-col gap-3">
              {dict.included.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm">
                  <Check className="size-4 shrink-0 text-primary" />
                  {item}
                </li>
              ))}
            </ul>

            <Button size="lg" className="mt-8 w-full" asChild>
              <Link href="/auth/sign-up">{dict.cta}</Link>
            </Button>
            <p className="mt-3 text-center text-xs text-muted-foreground">
              {dict.note}
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
