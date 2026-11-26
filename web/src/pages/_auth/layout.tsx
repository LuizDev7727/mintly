import { createFileRoute, Outlet, useMatchRoute } from "@tanstack/react-router";
import { AuthShowcasePanel } from "./-components/auth-showcase-panel";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const matchRoute = useMatchRoute();

  const isOnboarding = Boolean(matchRoute({ to: "/sign-up/onboarding" }));

  const panel = isOnboarding
    ? {
        title: "Your workspace, ready in three steps.",
        text: "Invite your team, create a channel and connect YouTube.",
      }
    : {
        title: "Turn long videos into clips that get posted.",
        text: "Mintly finds the best moments and publishes them for you.",
      };

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="relative z-10 flex flex-col gap-4 bg-background p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <img src="/logo.svg" className="size-6" alt="Mintly" />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div
            data-wide={isOnboarding}
            className="w-full flex flex-col items-center max-w-xs space-y-6 data-[wide=true]:max-w-130"
          >
            <Outlet />
          </div>
        </div>
        {isOnboarding && (
          <p className="text-sm text-muted-foreground">© 2026 Mintly</p>
        )}
      </div>
      <AuthShowcasePanel title={panel.title} text={panel.text} />
    </div>
  );
}
