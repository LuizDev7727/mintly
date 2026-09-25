import { authClient } from "@/lib/auth";
import { redirect } from "@tanstack/react-router";
import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    const hasSession = session !== null;

    if (hasSession) {
      throw redirect({ to: "/orgs" });
    }
  },
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-svh lg:grid-cols-1">
      <div className="relative z-10 flex flex-col gap-4 bg-background p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start"/>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full flex flex-col items-center max-w-xs space-y-6">

            <div className="flex flex-col items-center space-y-2 text-center">
              <a target="__blank" href="https://mintly-lp.vercel.app/en" className="w-fit rounded-full p-4 border">
                <img src="/logo.svg" className="size-8"/>
              </a>
              <h1 className="text-2xl font-bold">Mintly</h1>
              <p className="text-muted-foreground text-sm">
                Your app to manage your posts.
              </p>
            </div>
            <Outlet />

          </div>
        </div>
      </div>
    </div>
  );
}
