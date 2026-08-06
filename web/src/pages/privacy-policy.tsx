import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/privacy-policy")({
  head: () => ({
    meta: [
      {
        name: "description",
        content: "Privacy Policy for Mintly.",
      },
      { title: "Privacy Policy | Mintly" },
    ],
  }),
  component: PrivacyPolicyPage,
});

const LAST_UPDATED = "August 6, 2026";

function PrivacyPolicyPage() {
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
        <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {LAST_UPDATED}
        </p>

        <div className="mt-10 flex flex-col gap-8 text-sm leading-6 text-muted-foreground">
          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              1. Overview
            </h2>
            <p>
              This Privacy Policy explains what information Mintly Inc.
              ("Mintly", "we", "us") collects when you use Mintly (the
              "Service"), how we use it, and the choices you have. By using
              the Service, you agree to the collection and use of
              information as described here.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              2. Information we collect
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <span className="text-foreground">Account information:</span>{" "}
                name, email address, and profile picture, provided by you or
                by a sign-in provider such as Google.
              </li>
              <li>
                <span className="text-foreground">
                  Connected platform data:
                </span>{" "}
                when you connect a third-party account (such as TikTok), we
                receive an access/refresh token and basic public profile
                information (such as display name and avatar) needed to show
                which account is connected and to publish content on your
                behalf.
              </li>
              <li>
                <span className="text-foreground">Your content:</span> the
                videos, images, captions, and other material you upload to
                schedule or publish.
              </li>
              <li>
                <span className="text-foreground">Usage data:</span> basic
                product analytics (such as pages visited and features used)
                to help us maintain and improve the Service.
              </li>
            </ul>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              3. How we use your information
            </h2>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                To operate the Service, including publishing or scheduling
                content to the platforms you connect and explicitly instruct
                us to publish to.
              </li>
              <li>
                To display connected account details in your dashboard so you
                can confirm which account is linked.
              </li>
              <li>
                To power optional AI-assisted features (such as
                transcription, thumbnail suggestions, or summaries), which
                may involve sending your content to a third-party AI
                provider for processing.
              </li>
              <li>
                To send transactional emails, such as account welcome
                messages and team invitations.
              </li>
              <li>To maintain the security and reliability of the Service.</li>
            </ul>
            <p>
              We do not sell your personal information, and we do not use
              your content for advertising purposes.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              4. TikTok data specifically
            </h2>
            <p>
              When you connect your TikTok account, Mintly requests only the
              scopes required to operate the Service: basic profile
              information (display name and avatar, used to confirm which
              account is connected) and the ability to upload and publish
              videos on your behalf when you create or schedule a post.
              Mintly does not access your TikTok followers, direct messages,
              or any TikTok data beyond what these scopes provide. You can
              disconnect your TikTok account at any time from your Mintly
              integration settings; doing so revokes Mintly's access token
              and stops any further use of your TikTok data. You may also
              request deletion of any TikTok-derived data we hold by
              contacting us as described in Section 8.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              5. Third-party services
            </h2>
            <p>
              We use trusted third-party providers to operate the Service,
              including cloud hosting and file storage, background job
              processing, transactional email delivery, and AI model
              providers used only for the specific feature you invoke. Each
              provider processes data solely to provide their service to us
              and is bound by their own privacy and security obligations.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              6. Data storage and security
            </h2>
            <p>
              Your data is stored on encrypted infrastructure with access
              restricted to what is required to operate the Service.
              Connected-account tokens are stored securely and are never
              exposed to other users or organizations.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              7. Data retention
            </h2>
            <p>
              We retain your information for as long as your account is
              active. If you delete your account, we delete or anonymize
              your personal data and disconnect any linked third-party
              accounts within a reasonable period, except where we are
              required to retain certain records by law.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              8. Your rights
            </h2>
            <p>
              You can access, update, or delete your account information at
              any time from your Mintly settings, or by contacting us at{" "}
              <a href="mailto:privacy@mintly.app" className="underline">
                privacy@mintly.app
              </a>
              . This includes requesting deletion of data associated with a
              connected third-party account such as TikTok.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              9. Children's privacy
            </h2>
            <p>
              The Service is not directed at children under 16, and we do
              not knowingly collect personal information from them.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              10. Changes to this policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Material
              changes will be communicated through the Service or by email.
            </p>
          </section>

          <section className="flex flex-col gap-2">
            <h2 className="text-lg font-semibold text-foreground">
              11. Contact
            </h2>
            <p>
              Questions about this Privacy Policy or requests regarding your
              data can be sent to{" "}
              <a href="mailto:privacy@mintly.app" className="underline">
                privacy@mintly.app
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
            <Link to="/terms-of-service" className="hover:text-foreground">
              Terms of Service
            </Link>
            <p>© {new Date().getFullYear()} Mintly. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
