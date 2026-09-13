"use client";

import { ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "./ui/button";
import { LanguageSwitcher } from "./language-switcher";

type MobileNavProps = {
  links: { href: string; label: string }[];
};

export function MobileNav({ links }: MobileNavProps) {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <div className="sm:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Toggle navigation menu"
        aria-expanded={open}
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </Button>

      {open && (
        <div className="absolute inset-x-0 top-16 z-40 flex flex-col gap-4 border-t border-b border-border bg-background px-6 py-4">
          <nav className="flex flex-col gap-4 text-sm text-muted-foreground">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="border-t border-border pt-4">
            <LanguageSwitcher />
          </div>

          <div className="flex flex-col gap-2">
            <Button
              variant="ghost"
              className="w-full"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="https://mintly-six.vercel.app/auth">Sign In</Link>
            </Button>
            <Button
              className="w-full"
              asChild
              onClick={() => setOpen(false)}
            >
              <Link href="https://mintly-six.vercel.app/auth/sign-up">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
