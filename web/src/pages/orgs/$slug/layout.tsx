import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { authClient } from "@/lib/auth";
import { getOnboardingHttp } from "@/http/onboarding/get-onboarding.http";
import { NavUser } from "@/components/nav-user";
import { NavigationBreadcrumb } from "@/components/navigation-breadcrumb";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";
import { AiChatPanel } from "@/components/ai-chat";
import { useBoolVariation } from "@launchdarkly/react-sdk";
import { LaunchDarklyIdentify } from "@/components/launchdarkly-identify";

export const Route = createFileRoute("/orgs/$slug")({
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    const isSessionEmpty = session === null;

    if (isSessionEmpty) {
      throw redirect({ to: "/" });
    }

    // The app is blocked until the user finishes the onboarding.
    const { completed } = await getOnboardingHttp();

    if (!completed) {
      throw redirect({ to: "/sign-up/onboarding" });
    }
  },
  component: OrganizationLayout,
});

function OrganizationLayout() {

  const [isChatOpen, setIsChatOpen] = useState(false);
  const isAiChatEnabled = useBoolVariation("ai-chat", false)

  return (
    <SidebarProvider>
      <LaunchDarklyIdentify />
      <AppSidebar />
      <SidebarInset>
        <header className="sticky border-b border-input top-0 z-10 flex items-center justify-between bg-sidebar h-16.25 shrink-0 gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 pr-4">
          <div className="flex min-w-0 items-center gap-x-2 px-2">
            <SidebarTrigger />
            <NavigationBreadcrumb/>
          </div>
          <div className="flex items-center gap-x-3">
            <div className="bg-border h-5 w-px" />
            <NavUser />
            {isAiChatEnabled && (
              <Button
                variant="ghost"
                size="icon-sm"
                data-active={isChatOpen}
                onClick={() => setIsChatOpen((open) => !open)}
              >
                <Sparkles />
                <span className="sr-only">Toggle AI chat</span>
              </Button>
            )}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4">
          <Outlet />
        </div>
      </SidebarInset>
      {isAiChatEnabled && (
        <AiChatPanel open={isChatOpen} onOpenChange={setIsChatOpen} />
      )}
    </SidebarProvider>
  );
}
