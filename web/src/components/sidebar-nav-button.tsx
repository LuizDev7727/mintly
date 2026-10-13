import type { LucideIcon } from "lucide-react";
import { useMatchRoute, type LinkProps } from "@tanstack/react-router";

import { FlickeringGrid } from "@/components/flickering-grid";
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
  const matchRoute = useMatchRoute();
  const { state } = useSidebar();

  const isCurrent = !!matchRoute({ to: linkProps.to });

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
      className="isolate h-9 border border-transparent text-muted-foreground data-[current=true]:border-sidebar-border data-[current=true]:bg-foreground/5 data-[current=true]:font-medium data-[current=true]:text-foreground data-[current=true]:hover:bg-foreground/5!"
      asChild
    >
      <NavLink {...linkProps}>
        {isCurrent && (
          <FlickeringGrid
            aria-hidden="true"
            color="#bef264"
            squareSize={2}
            gridGap={2}
            maxOpacity={0.7}
            flickerChance={0.2}
            className="pointer-events-none absolute inset-y-0 right-0 -z-10 w-28 mask-[linear-gradient(to_left,black,transparent)] group-data-[collapsible=icon]:hidden"
          />
        )}
        <span className="flex size-4 shrink-0 items-center justify-center">
          <Icon />
        </span>
        <span>{label}</span>
      </NavLink>
    </SidebarMenuButton>
  );
}
