import type { LucideIcon } from "lucide-react";
import type { LinkProps } from "@tanstack/react-router";

import { SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "./nav-link";

type SidebarNavButtonProps = LinkProps & {
  icon: LucideIcon;
  label: string;
  description: string;
};

export function SidebarNavButton({
  icon: Icon,
  label,
  description,
  ...linkProps
}: SidebarNavButtonProps) {
  const { state } = useSidebar();

  return (
    <SidebarMenuButton
      tooltip={{
        children: (
          <div>
            {state === "collapsed" && <p className="font-medium">{label}</p>}
            <p>{description}</p>
          </div>
        ),
        hidden: false,
        sideOffset: 8,
      }}
      className="text-muted-foreground data-[current=true]:bg-foreground/5 data-[current=true]:font-medium data-[current=true]:text-foreground data-[current=true]:hover:bg-foreground/5!"
      asChild
    >
      <NavLink {...linkProps}>
        <span className="flex size-4 shrink-0 items-center justify-center">
          <Icon />
        </span>
        <span>{label}</span>
      </NavLink>
    </SidebarMenuButton>
  );
}
