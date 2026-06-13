import { OrganizationSwitcher } from "@/components/organization-switcher";
import { OrganizationTabs } from "@/components/organization-tabs";
import { Profile } from "@/components/profile";
import { ProjectSwitcher } from "@/components/project-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { Minus, Slash } from "lucide-react";
import Search from "./search";

interface HeaderProps {
  slug: string;
}

export function Header({ slug }: HeaderProps) {
  return (
    <header className="border-b border-border dark:bg-zinc-900/20">
      <div className="flex items-center justify-between px-6 py-3">
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Mintly" className="size-4" />
          <Minus className="size-6 -rotate-90 text-border" />
          <OrganizationSwitcher />
          <Slash className="size-3 rotate-[-24deg] text-border" />
          <ProjectSwitcher orgSlug={slug} />
        </div>
        <div className="flex items-center gap-x-2">
          <Search />
          <Minus className="size-6 -rotate-90 text-border" />
          <ThemeToggle />
          <Minus className="size-6 -rotate-90 text-border" />
          <Profile />
        </div>
      </div>
      <div className="px-6">
        <OrganizationTabs slug={slug} />
      </div>
    </header>
  );
}
