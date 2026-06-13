import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Header } from "@/components/header";

export const Route = createFileRoute("/orgs/$slug")({
  beforeLoad: () => {},
  component: OrganizationLayout,
});

function OrganizationLayout() {
  return (
    <div className="min-h-svh flex flex-col">
      <Header />
      <main className="flex-1 px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}
