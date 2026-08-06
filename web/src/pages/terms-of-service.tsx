import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/terms-of-service")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Terms of Service for Mintly.",
      },
      { title: "Terms of Service | Mintly" },
    ],
  }),
  component: TermsOfServicePage,
});

const LAST_UPDATED = "August 6, 2026";

function TermsOfServicePage() {
  return (
    <div className="w-full">
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <img src="/logo.svg" alt="" className="size-5" />
            Mintly
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="text-3xl font-bold tracking-tight">
          Terms of Service
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-6 text-muted-foreground">
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              1. Acceptance of terms
            </h2>
            <p>
              These Terms of Service ("Terms") govern your access to and use
              of Mintly (the "Service"), operated by Mintly Inc. ("Mintly",
              "we", "us"). By creating an account or using the Service, you
              agree to be bound by these Terms. If you do not agree, do not
              use the Service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              2. Description of the Service
            </h2>
            <p>
              Mintly lets you organize, schedule, and publish content across
              connected social media channels — including TikTok — from a
              single dashboard, and provides optional AI-assisted features
              such as transcription, thumbnail suggestions, and content
              summaries.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              3. Accounts
            </h2>
            <p>
              You must provide accurate information when creating an account
              and are responsible for maintaining the confidentiality of your
              credentials and for all activity that occurs under your
              account. You must be at least 16 years old to use the Service.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              4. Connecting third-party platforms
            </h2>
            <p>
              Mintly lets you connect third-party accounts (such as TikTok)
              via OAuth. By connecting an account, you authorize Mintly to
              access basic profile information and to upload and publish
              content to that account strictly on your instructions (for
              example, when you create or schedule a post). You remain solely
              responsible for complying with each connected platform's own
              terms of service and community guidelines. You can disconnect
              any connected account at any time from your Mintly settings,
              which revokes Mintly's access.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              5. Your content
            </h2>
            <p>
              You retain all ownership rights to the content (videos, images,
              captions, and other material) you upload to Mintly. You grant
              Mintly a limited license to store, process, and transmit that
              content solely for the purpose of operating the Service —
              including publishing it to the destinations you choose. You
              represent that you have all rights necessary to upload and
              publish your content, and that it does not infringe on the
              rights of others or violate applicable law.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              6. Acceptable use
            </h2>
            <p>
              You agree not to use the Service to publish unlawful content,
              infringe intellectual property rights, distribute malware,
              harass others, or attempt to interfere with the Service's
              security or availability.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              7. AI-assisted features
            </h2>
            <p>
              Some features use third-party AI models to generate
              suggestions (such as transcripts, thumbnails, or descriptions).
              These suggestions may be inaccurate — you are responsible for
              reviewing AI-generated output before publishing it.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              8. Subscriptions and billing
            </h2>
            <p>
              Certain features require a paid subscription, billed per
              organization. Fees are described at the time of purchase and
              are non-refundable except where required by law.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              9. Termination
            </h2>
            <p>
              You may stop using the Service and delete your account at any
              time. We may suspend or terminate access to the Service if you
              violate these Terms. Upon account deletion, we delete or
              anonymize your data as described in our{" "}
              <Link to="/privacy-policy" className="underline">
                Privacy Policy
              </Link>
              .
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              10. Disclaimers and limitation of liability
            </h2>
            <p>
              The Service is provided "as is" without warranties of any
              kind. To the maximum extent permitted by law, Mintly is not
              liable for indirect, incidental, or consequential damages
              arising from your use of the Service, including any action
              taken by a connected third-party platform.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              11. Changes to these Terms
            </h2>
            <p>
              We may update these Terms from time to time. Material changes
              will be communicated through the Service or by email. Continued
              use of the Service after changes take effect constitutes
              acceptance of the updated Terms.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              12. Contact
            </h2>
            <p>
              Questions about these Terms can be sent to{" "}
              <a
                href="mailto:support@mintly.app"
                className="underline"
              >
                support@mintly.app
              </a>
              .
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border py-8">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-between gap-4 px-6 text-sm text-muted-foreground sm:flex-row">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="" className="size-5" />
            Mintly Inc.
          </div>
          <div className="flex items-center gap-4">
            <Link to="/privacy-policy" className="hover:text-foreground">
              Privacy Policy
            </Link>
            <p>© {new Date().getFullYear()} Mintly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
