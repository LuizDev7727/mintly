import { authClient } from "@/lib/auth";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { PlatformLoading } from "./-components/platform-loading";

export const Route = createFileRoute("/orgs/")({
  component: NoOrganizationSet,
});

function NoOrganizationSet() {
  const { data, isPending, error } = authClient.useActiveOrganization();

  if (isPending || !data) {
    return <PlatformLoading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <Navigate to="/orgs/$slug" params={{ slug: data.slug }} replace />;
}
