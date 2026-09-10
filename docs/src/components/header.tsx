"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Menu } from "lucide-react";
import { useSidebar } from "./sidebar-context";
import { Tabs } from "./tabs";

export function Header() {
  const { toggle } = useSidebar();

  return (
    <header className="space-y-6 p-4 pb-0 bg-sidebar border border-transparent border-b-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label="Toggle sidebar"
            className="text-muted-foreground hover:text-foreground md:hidden"
          >
            <Menu className="size-5" />
          </button>
          <Image width={24} height={24} src="/logo.svg" alt="" />
        </div>

        <div className="flex items-center gap-6 text-sm">
          <Link href="/support" className="text-muted-foreground hover:text-foreground">
            Support
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1 font-medium text-primary hover:text-primary/80"
          >
            Dashboard
            <ChevronRight className="size-4" />
          </Link>
        </div>
      </div>

      <Tabs/>
    </header>
  );
}
