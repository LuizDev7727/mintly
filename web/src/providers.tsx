import { ThemeProvider } from "@/components/theme-provider";
import { NuqsAdapter } from "nuqs/adapters/tanstack-router";
import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ViewModeProvider } from "@/context/view-mode-context";
import { queryClient } from "./lib/react-query";
import { Toaster } from "./components/ui/sonner";
import { createLDReactProvider, type LDContext } from '@launchdarkly/react-sdk';
import { env } from "./env";

type ProvidersProps = {
  children: ReactNode;
};

// Initial context only: <LaunchDarklyIdentify /> swaps it for the real user and
// organization once they are known.
const context: LDContext = {
  kind: 'user',
  key: 'anonymous',
  anonymous: true,
};

const LDReactProvider = createLDReactProvider(
  env.VITE_LAUNCH_DAILY_KEY,
  context
);

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider defaultTheme="system" storageKey="mintly-ui-theme">
      <QueryClientProvider client={queryClient}>
        <NuqsAdapter>
          <TooltipProvider>
            <ViewModeProvider>
              <LDReactProvider>
                {children}
                <Toaster />
              </LDReactProvider>
            </ViewModeProvider>
          </TooltipProvider>
        </NuqsAdapter>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
