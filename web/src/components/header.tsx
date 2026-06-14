import { OrganizationSwitcher } from "@/components/organization-switcher";
import { OrganizationTabs } from "@/components/organization-tabs";
import { Profile } from "@/components/profile";
import { ProjectSwitcher } from "@/components/project-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Minus, Slash } from "lucide-react";
import Search from "./search";
import { Link, useParams } from "@tanstack/react-router";
import { CreateUploadButtonRedirect } from "./create-upload-button-redirect";

export function Header() {
  const { slug } = useParams({
    from: "/orgs/$slug",
  });

  return (
    <header className="border-b border-border dark:bg-zinc-900/20 space-y-4">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <Link to="/orgs/$slug" params={{ slug }}>
            <img src="/logo.svg" alt="Mintly" className="size-4" />
          </Link>
          <Minus className="size-6 -rotate-90 text-border" />
          <OrganizationSwitcher />
          <Slash className="size-3 rotate-[-24deg] text-border" />
          <ProjectSwitcher />
        </div>
        <div className="flex items-center gap-x-2">
          <Search />
          <Minus className="size-6 -rotate-90 text-border" />
          <CreateUploadButtonRedirect />
          {/*<ThemeToggle />*/}
          <Minus className="size-6 -rotate-90 text-border" />
          <Profile />
        </div>
      </div>
      <div className="px-6">
        <OrganizationTabs />
      </div>
    </header>
  );
}
