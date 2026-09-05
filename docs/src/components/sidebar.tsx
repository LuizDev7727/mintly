"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeftToLine,
  BookOpen,
  Newspaper,
  type LucideIcon,
  Webhook,
} from "lucide-react";
import { useSidebar } from "./sidebar-context";

type NavItem = {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: { label: string; className: string };
};

type NavSection = {
  title: string;
  items: NavItem[];
};

function getSections(pathname: string): NavSection[] {
  if (pathname.startsWith("/api-reference")) {
    return [
      {
        title: "API Reference",
        items: [{ label: "Introduction", href: "/api-reference" }],
      },
      {
        title: "Endpoints",
        items: [
          {
            label: "Get Projects",
            href: "/api-reference/get-projects",
            badge: {
              label: "GET",
              className: "bg-emerald-500/15 text-emerald-300",
            },
          },
        ],
      },
    ];
  }

  if (pathname.startsWith("/webhooks")) {
    return [
      {
        title: "Webhooks",
        items: [{ label: "Getting started", href: "/webhooks" }],
      },
      {
        title: "Events",
        items: [
          { label: "Events", href: "/webhooks/events", icon: Webhook },
        ],
      },
    ];
  }

  return [
    {
      title: "Get Started",
      items: [{ label: "Introduction", href: "/" }],
    },
  ];
}

export function Sidebar() {
  const pathname = usePathname();
  const sections = getSections(pathname);
  const { open, close } = useSidebar();

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={close}
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 w-80 shrink-0 -translate-x-full overflow-y-auto border-r border-sidebar-border bg-sidebar p-6 text-sidebar-foreground transition-transform duration-200 md:static md:z-auto md:translate-x-0 md:bg-transparent ${
          open ? "translate-x-0" : ""
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium">
            <BookOpen className="size-4" />
            Documentation
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Close sidebar"
            className="text-muted-foreground hover:text-foreground"
          >
            <ArrowLeftToLine className="size-4" />
          </button>
        </div>

        <nav className="mt-8 flex flex-col gap-6">
          {sections.map((section) => (
            <div key={section.title}>
              <p className="text-sm font-semibold">{section.title}</p>

              <div className="mt-2 flex flex-col gap-2">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-2 text-sm ${
                        isActive
                          ? "font-medium text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {item.badge ? (
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${item.badge.className}`}
                        >
                          {item.badge.label}
                        </span>
                      ) : null}
                      {Icon ? <Icon className="size-4" /> : null}
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
