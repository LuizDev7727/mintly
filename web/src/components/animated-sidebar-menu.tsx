import {
  createContext,
  useContext,
  useId,
  useState,
  type ComponentProps,
} from "react";
import { motion, useReducedMotion } from "framer-motion";

import { SidebarMenu, SidebarMenuItem } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const SPRING_LAYOUT = { type: "spring", stiffness: 360, damping: 32, mass: 0.6 } as const;

type AnimatedSidebarMenuContextValue = {
  layoutId: string;
  activeId: string | null;
  setActiveId: (id: string | null) => void;
};

const AnimatedSidebarMenuContext =
  createContext<AnimatedSidebarMenuContextValue | null>(null);

export function AnimatedSidebarMenu({
  onMouseLeave,
  ...props
}: ComponentProps<typeof SidebarMenu>) {
  const layoutId = `sidebar-hover-${useId()}`;
  const [activeId, setActiveId] = useState<string | null>(null);

  return (
    <AnimatedSidebarMenuContext.Provider
      value={{ layoutId, activeId, setActiveId }}
    >
      <SidebarMenu
        onMouseLeave={(event) => {
          setActiveId(null);
          onMouseLeave?.(event);
        }}
        {...props}
      />
    </AnimatedSidebarMenuContext.Provider>
  );
}

export function AnimatedSidebarMenuItem({
  className,
  children,
  onMouseEnter,
  ...props
}: ComponentProps<typeof SidebarMenuItem>) {
  const context = useContext(AnimatedSidebarMenuContext);
  const id = useId();
  const reduceMotion = useReducedMotion();

  if (!context) {
    throw new Error(
      "AnimatedSidebarMenuItem must be used inside AnimatedSidebarMenu",
    );
  }

  const isHovered = context.activeId === id;

  return (
    <SidebarMenuItem
      className={cn(
        "[&>[data-sidebar=menu-button]]:relative [&>[data-sidebar=menu-button]:not([data-current=true])]:hover:bg-transparent!",
        className,
      )}
      onMouseEnter={(event) => {
        context.setActiveId(id);
        onMouseEnter?.(event);
      }}
      {...props}
    >
      {isHovered && (
        <motion.div
          aria-hidden="true"
          layoutId={context.layoutId}
          className="bg-foreground/5 pointer-events-none absolute inset-0 rounded-md"
          transition={reduceMotion ? { duration: 0 } : SPRING_LAYOUT}
        />
      )}
      {children}
    </SidebarMenuItem>
  );
}
