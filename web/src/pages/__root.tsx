import { createRootRoute, HeadContent, Outlet } from "@tanstack/react-router";
import { Providers } from "@/providers";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      <HeadContent />
      <Providers>
        <Outlet />
      </Providers>
    </>
  );
}
