"use client";

import { ChevronDown } from "lucide-react";
import { Accordion } from "radix-ui";

type FAQDict = {
  title: string;
  subtitle: string;
  items: { question: string; answer: string }[];
};

type FAQProps = {
  dict: FAQDict;
};

export function FAQ({ dict }: FAQProps) {
  return (
    <section className="border-t border-border bg-card/40 py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight">{dict.title}</h2>
          <p className="mt-3 text-muted-foreground">{dict.subtitle}</p>
        </div>

        <Accordion.Root type="single" collapsible className="flex flex-col gap-3">
          {dict.items.map((faq) => (
            <Accordion.Item
              key={faq.question}
              value={faq.question}
              className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10"
            >
              <Accordion.Header>
                <Accordion.Trigger className="group flex w-full cursor-pointer items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium">
                  {faq.question}
                  <ChevronDown className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]:rotate-180" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content className="overflow-hidden text-sm text-muted-foreground">
                <p className="px-5 pb-4">{faq.answer}</p>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </div>
    </section>
  );
}
