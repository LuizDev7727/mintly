import { Cookie } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { acceptCookies, rejectCookies } from "@/actions/cookie-consent";
import { Button } from "@/components/ui/button";

export async function CookieBanner() {
  const cookieStore = await cookies();
  const consent = cookieStore.get("cookie_mintly_consent");

  if (consent) {
    return null;
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-full max-w-sm rounded-2xl border border-border bg-card p-5 shadow-lg">
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-lg border border-border">
          <Cookie className="size-6 text-foreground" />
        </div>

        <div className="flex flex-col gap-1">
          <p className="text-sm font-semibold text-foreground">
            We use cookies
          </p>
          <p className="text-sm text-muted-foreground">
            We use cookies to improve your experience and analyze site
            traffic. By continuing, you agree to our{" "}
            <Link
              href="/privacy-policy"
              className="text-foreground underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <form action={rejectCookies}>
          <Button type="submit" variant="outline" className="w-full">
            Reject
          </Button>
        </form>
        <form action={acceptCookies}>
          <Button type="submit" className="w-full">
            Accept all
          </Button>
        </form>
      </div>
    </div>
  );
}
