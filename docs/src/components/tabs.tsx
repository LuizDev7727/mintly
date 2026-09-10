"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "Introduction", href: "/" },
  { label: "API Reference", href: "/api-reference" },
  { label: "Webhooks", href: "/webhooks" },
];

export function Tabs() {
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-6 text-sm">
      {tabs.map(({ label, href }) => {
        const isActive =
          href === "/" ? pathname === "/" : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            className={`pb-2 border border-transparent transition-colors ${
              isActive
                ? "border-b-primary text-foreground font-medium"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {label}
          </Link>
        );
      })}
    </div>
  );
}
