import { NextRequest, NextResponse } from "next/server";
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['en', 'pt']
const defaultLocale = 'en'

const DISTINCT_ID_COOKIE = "posthog_distinct_id"
const DISTINCT_ID_MAX_AGE = 60 * 60 * 24 * 365

// Get the preferred locale, similar to the above or using a library
function getLocale(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())
  const languages = new Negotiator({ headers }).languages()
  return match(languages, locales, defaultLocale)
}

export function proxy(request: NextRequest) {
  // Check if there is any supported locale in the pathname
  const { pathname } = request.nextUrl
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )

  const response = pathnameHasLocale
    ? NextResponse.next()
    : (() => {
        // Redirect if there is no locale
        const locale = getLocale(request)
        request.nextUrl.pathname = `/${locale}${pathname}`
        // e.g. incoming request is /products
        // The new URL is now /en/products
        return NextResponse.redirect(request.nextUrl)
      })()

  // posthog-node has no client-side SDK to generate/persist an anonymous ID,
  // so we mint one ourselves here and reuse it on every server-side capture()
  // call — this keeps a given visitor's events under a single distinct_id.
  if (!request.cookies.has(DISTINCT_ID_COOKIE)) {
    response.cookies.set(DISTINCT_ID_COOKIE, crypto.randomUUID(), {
      path: "/",
      maxAge: DISTINCT_ID_MAX_AGE,
      sameSite: "lax",
    })
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|.*\\..*|favicon.ico).*)'],
}
