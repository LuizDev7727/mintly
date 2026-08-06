import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth";
import { Link, redirect } from "@tanstack/react-router";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { ArrowLeft, GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/auth")({
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
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden flex-col bg-primary lg:flex">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "radial-gradient(rgba(10,10,10,0.35) 1px, transparent 1px)",
            backgroundSize: "18px 18px",
          }}
        />

        <div className="flex flex-col gap-6 p-10">
          <div className="flex size-10 items-center justify-center rounded-lg bg-zinc-950">
            <img src="/logo.svg" alt="" className="size-5" />
          </div>
          <div className="flex flex-col gap-3">
            <h1 className="max-w-md text-3xl font-bold tracking-tight text-balance text-primary-foreground xl:text-4xl">
              Schedule, publish, and track your content across every channel
            </h1>
            <p className="max-w-sm text-primary-foreground/70">
              Mintly connects your channels, organizes your content, and
              tracks growth — all in one place.
            </p>
          </div>
        </div>

        <img
          src="/dashboard-app.svg"
          alt="Mintly dashboard"
          className="scale-125 rounded-l-sm absolute mt-10 left-40 top-85"
        />

      </div>
      <div className="relative z-10 flex flex-col gap-4 bg-background p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Button variant={'outline'} asChild>
            <Link to="/">
              <ArrowLeft className="size-4"/>
              <p>Back to Home</p>
            </Link>
          </Button>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
