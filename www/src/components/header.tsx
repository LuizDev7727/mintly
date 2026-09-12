import { getDictionary } from "@/app/[lang]/dictionaries"
import Link from "next/link"
import { lang } from "next/root-params"
import { Button } from "./ui/button"
import { LanguageSwitcher } from "./language-switcher"
import { MobileNav } from "./mobile-nav"
import { ArrowRight } from "lucide-react"

export async function Header() {

  const locale = await lang()
  const dict = await getDictionary()

  const navLinks = [
    { href: `/${locale}/blog`, label: "Blog" },
    { href: `/${locale}/changelog`, label: "Changelog" },
  ]

  return (
    <header className="relative top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
          Mintly
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <div className="hidden items-center gap-2 sm:flex">
            <LanguageSwitcher />

            <Button variant="ghost" asChild>
              <Link href="https://mintly-six.vercel.app/auth">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="https://mintly-six.vercel.app/auth/sign-up">
                Get started
                <ArrowRight />
              </Link>
            </Button>
          </div>

          <MobileNav links={navLinks} />
        </div>
      </div>
    </header>
  )
}
