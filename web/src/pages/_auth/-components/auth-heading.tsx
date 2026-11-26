export function AuthHeading() {
  return (
    <div className="flex flex-col items-center space-y-2 text-center">
      <a
        target="__blank"
        href="https://mintly-lp.vercel.app/en"
        className="w-fit rounded-full p-4 border"
      >
        <img src="/logo.svg" className="size-8" alt="Mintly" />
      </a>
      <h1 className="text-2xl font-bold">Mintly</h1>
      <p className="text-muted-foreground text-sm">
        Your app to manage your posts.
      </p>
    </div>
  );
}
