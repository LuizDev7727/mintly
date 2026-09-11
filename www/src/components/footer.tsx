import Image from "next/image";
import Link from "next/link";
import { lang } from "next/root-params";

export async function Footer() {
  const locale = await lang();

  return (
    <footer className="border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <Image width={10} height={10} src="/logo.svg" alt="" />
          Mintly Inc.
        </div>
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/terms-of-service`}
            className="hover:text-foreground"
          >
            Terms of Service
          </Link>
          <Link
            href={`/${locale}/privacy-policy`}
            className="hover:text-foreground"
          >
            Privacy Policy
          </Link>
        </div>
        <p>© {new Date().getFullYear()} Mintly. All rights reserved.</p>
      </div>
    </footer>
  );
}
