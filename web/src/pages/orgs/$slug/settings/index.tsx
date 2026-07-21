import { z } from "zod";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { GeneralTab } from "./-components/general/general-tab";
import { getActiveOrganizationHttp } from "@/http/organization/get-active-organization.http";
import { useQuery } from "@tanstack/react-query";

const settingsSearchSchema = z.object({
  tab: z.enum(["general", "billing"]).default("general"),
});

export const Route = createFileRoute("/orgs/$slug/settings/")({
  head: () => ({
    meta: [
      { title: "Settings | Mintly" },
      { name: "description", content: "Organization settings." },
    ],
  }),
  validateSearch: settingsSearchSchema,
  component: SettingsPage,
});

const navItems = [
  { id: "general", label: "General", icon: Settings },
] as const;

function SettingsPage() {
  const { slug } = Route.useParams();
  const { tab } = Route.useSearch();

  const { data } = useQuery({
    queryKey: ["active-organization"],
    queryFn: getActiveOrganizationHttp,
  });

  const organization = data?.organization;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold">Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage your organization settings
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:gap-8">
        <nav className="flex gap-0.5 overflow-x-auto md:w-44 md:shrink-0 md:flex-col md:overflow-visible">
          {navItems.map(({ id, label, icon: Icon }) => (
            <Link
              key={id}
              to="/orgs/$slug/settings"
              params={{ slug }}
              search={{ tab: id }}
              data-tab={id}
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                tab === id
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:bg-accent/50 hover:text-foreground",
              )}
            >
              <Icon className="size-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <GeneralTab
            name={organization!.name}
            avatarUrl={organization!.logo}
          />
        </div>
      </div>
    </div>
  );
}
