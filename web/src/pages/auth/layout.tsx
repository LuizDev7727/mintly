import { Link } from "@tanstack/react-router";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { GalleryVerticalEnd } from "lucide-react";

export const Route = createFileRoute("/auth")({
  beforeLoad: () => {},
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="w-full h-full grid min-h-svh lg:grid-cols-2">
      <div className="relative hidden bg-primary lg:flex flex-col overflow-hidden px-10 pt-10">
        <header className="relative z-10 mb-10">
          <h1 className="text-zinc-900 text-[30px] font-semibold">
            Schedule, publish, and track your content across
          </h1>
          <p className="text-sm font-medium text-zinc-800">
            Mintly connects your channels, organizes your content, and tracks
            growth — all in one place.
          </p>
        </header>

        <img
          className="absolute -bottom-10 left-8 scale-125 origin-bottom-left rounded-l-sm shadow-2xl object-cover object-top"
          src="/dashboard-app.png"
          alt="Dashboard Image"
        />
      </div>

      <div className="relative z-10 flex flex-col gap-4 bg-background p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <Link to="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Mintly Inc.
          </Link>
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
