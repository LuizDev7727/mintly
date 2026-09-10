import { getDictionary } from "@/app/[lang]/dictionaries"
import Link from "next/link"
import { lang } from "next/root-params"
import { Button } from "./ui/button"
import { ArrowRight } from "lucide-react"

export async function Header() {

  const locale = await lang()
  const dict = await getDictionary()

  return (
    <header className="top-0 z-50">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-8 px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2 font-medium">
          Mintly
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground sm:flex">
          <Link href={`/${locale}/blog`} className="hover:text-foreground">
            Blog
          </Link>
          <Link href={`/${locale}/changelog`} className="hover:text-foreground">
            Changelog
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link href="/auth">Sign In</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">
              Get started
              <ArrowRight />
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
