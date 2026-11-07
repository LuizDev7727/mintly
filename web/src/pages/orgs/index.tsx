import { useQuery } from "@tanstack/react-query";
import { createFileRoute, Navigate } from "@tanstack/react-router";
import { getActiveOrganizationHttp } from "@/http/organization/get-active-organization.http";
import { PlatformLoading } from "./-components/platform-loading";

export const Route = createFileRoute("/orgs/")({
  component: NoOrganizationSet,
});

function NoOrganizationSet() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["active-organization"],
    queryFn: getActiveOrganizationHttp,
  });

  if (isLoading || !data) {
    return <PlatformLoading />;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <Navigate to="/orgs/$slug" params={{ slug: data.organization.slug }} replace />;
}
