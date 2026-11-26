export function AuthTerms() {
  return (
    <p className="text-center text-sm text-muted-foreground">
      By clicking continue, you agree to our{" "}
      <a
        href="https://mintly-lp.vercel.app/en/terms-of-service"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-primary"
      >
        Terms of Service
      </a>{" "}
      and{" "}
      <a
        href="https://mintly-lp.vercel.app/en/privacy-policy"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-4 hover:text-primary"
      >
        Privacy Policy
      </a>
      .
    </p>
  );
}
