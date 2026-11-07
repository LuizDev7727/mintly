import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import type { ReactNode } from "react";
import { ThemeProvider } from "@/components/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewModeProvider } from "@/context/view-mode-context";
import { Toaster } from "./components/ui/sonner";
import { queryClient } from "./lib/react-query";

type ProvidersProps = {
  children: ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mintly-ui-theme">
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <TooltipProvider>
            <ViewModeProvider>
              {children}
              <Toaster />
            </ViewModeProvider>
          </TooltipProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
