"use client";

import { AlignLeft } from "lucide-react";
import { useActiveHeading } from "@/hooks/use-active-heading";

type OnThisPageItem = {
  id: string;
  label: string;
  indent?: boolean;
};

type OnThisPageProps = {
  items: OnThisPageItem[];
};

export function OnThisPage({ items }: OnThisPageProps) {
  const activeId = useActiveHeading(items.map((item) => item.id));

  return (
    <nav className="hidden w-48 shrink-0 xl:fixed xl:right-8 xl:top-28 xl:block">
      <p className="flex items-center gap-2 text-sm font-medium text-foreground">
        <AlignLeft className="size-4" />
        On this page
      </p>

      <div className="mt-3 flex flex-col gap-2 border-l border-border pl-3">
        {items.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`text-sm ${item.indent ? "pl-3" : ""} ${
              activeId === item.id
                ? "font-medium text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
