import { Link } from "@tanstack/react-router";
import { LayoutDashboardIcon, Settings2Icon, UsersIcon } from "lucide-react";

const tabs = [
  { label: "Overview", icon: LayoutDashboardIcon, to: "overview" },
  { label: "Members", icon: UsersIcon, to: "members" },
  { label: "Settings", icon: Settings2Icon, to: "settings" },
] as const;

interface OrganizationTabsProps {
  slug: string;
}

export function OrganizationTabs({ slug }: OrganizationTabsProps) {
  return (
    <nav className="flex items-center gap-2 border-b border-border">
      {tabs.map(({ label, icon: Icon, to }) => (
        <Link
          key={to}
          to={`/orgs/${slug}/${to}` as never}
          activeProps={{ className: "border-b-2 border-foreground text-foreground" }}
          inactiveProps={{ className: "text-muted-foreground hover:text-foreground" }}
          className="flex items-center gap-2 px-1 pb-3 pt-1 text-sm font-medium transition-colors -mb-px"
        >
          <Icon size={15} />
          {label}
        </Link>
      ))}
    </nav>
  );
}
