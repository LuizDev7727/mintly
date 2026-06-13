import { useParams } from "@tanstack/react-router";
import {
  ChartPieIcon,
  LayoutDashboardIcon,
  Settings2Icon,
  UsersIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { NavLink } from "./nav-link";

export function OrganizationTabs() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  const buttonStyle =
    "h-full data-[current=true]:text-foreground pb-4 justify-center rounded-none border-transparent border-y-2 font-medium hover:border-b-primary text-muted-foreground hover:bg-transparent! data-[current=true]:border-b-primary data-[current=true]:bg-transparent!";

  return (
    <nav className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm" className={buttonStyle}>
        <NavLink to={`/orgs/$slug`} params={{ slug }}>
          <LayoutDashboardIcon className="size-4" />
          Projects
        </NavLink>
      </Button>
      <Button asChild variant="ghost" size="sm" className={buttonStyle}>
        <NavLink to={`/orgs/$slug/usage`} params={{ slug }}>
          <ChartPieIcon className="size-4" />
          Usage
        </NavLink>
      </Button>
      <Button asChild variant="ghost" size="sm" className={buttonStyle}>
        <NavLink to={`/orgs/$slug/members`} params={{ slug }}>
          <UsersIcon className="size-4" />
          Members
        </NavLink>
      </Button>
      <Button asChild variant="ghost" size="sm" className={buttonStyle}>
        <NavLink to={`/orgs/$slug/settings`} params={{ slug }}>
          <Settings2Icon className="size-4" />
          Settings
        </NavLink>
      </Button>
    </nav>
  );
}
