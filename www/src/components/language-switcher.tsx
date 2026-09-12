"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/app/[lang]/locales";
import { cn } from "@/lib/utils";

const localeFlags: Record<Locale, string> = {
  en: "🇺🇸",
  pt: "🇧🇷",
};

export function LanguageSwitcher() {
  const pathname = usePathname();
  const segments = pathname.split("/");
  const currentLocale = segments[1];
  const restOfPath = segments.slice(2).join("/");

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-card p-1">
      {locales.map((locale) => {
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={`/${locale}${restOfPath ? `/${restOfPath}` : ""}`}
            className={cn(
              "flex size-7 items-center justify-center rounded-md text-base transition-colors",
              isActive ? "bg-muted" : "opacity-50 hover:opacity-100",
            )}
          >
            <span aria-hidden>{localeFlags[locale]}</span>
            <span className="sr-only">{locale}</span>
          </Link>
        );
      })}
    </div>
  );
}
