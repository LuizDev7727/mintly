import { Skeleton } from "@/components/ui/skeleton";
import { getOnboardingHttp } from "@/http/onboarding/get-onboarding.http";
import { authClient } from "@/lib/auth";
import { useQuery } from "@tanstack/react-query";
import { createFileRoute, redirect } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { AddIntegrationStep } from "./-components/add-integration-step";
import { CreateChannelStepForm } from "./-components/create-channel-step-form";
import { InviteMemberFormStep } from "./-components/invite-member-form-step";

export const Route = createFileRoute("/_auth/sign-up/onboarding/")({
  head: () => ({
    meta: [
      { title: "Get started | Mintly" },
      {
        name: "description",
        content: "Set up your Mintly workspace in three steps.",
      },
    ],
  }),
  beforeLoad: async () => {
    const { data: session } = await authClient.getSession();

    if (session === null) {
      throw redirect({ to: "/" });
    }

    // Redirecting to /orgs only makes sense on entry: during the visit, the
    // last step completes on its own and the page must stay on "Connected".
    const { completed } = await getOnboardingHttp();

    if (completed) {
      throw redirect({ to: "/orgs" });
    }
  },
  component: OnboardingPage,
});

const STEPS = [
  {
    title: "Invite your team",
    description: "Add teammates now or skip and do it later.",
  },
  {
    title: "Create your channel",
    description: "A channel groups your projects and posts.",
  },
  {
    title: "Connect an integration",
    description: "Connect YouTube to publish your clips.",
  },
] as const;

function OnboardingPage() {
  const { data } = useQuery({
    queryKey: ["onboarding"],
    queryFn: getOnboardingHttp,
  });

  // Inviting already advances the server step, but the user may want to invite
  // more people: keep showing the invite step until they press Continue/Skip.
  const startedOnInvite = useRef<boolean | null>(null);
  const [hasLeftInvite, setHasLeftInvite] = useState(false);

  if (data === undefined) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (startedOnInvite.current === null) {
    startedOnInvite.current = data.step === 0;
  }

  const isOnInviteStep = startedOnInvite.current && !hasLeftInvite;
  const currentStep = isOnInviteStep
    ? 0
    : Math.max(data.step, hasLeftInvite ? 1 : 0);
  const { organizationSlug, channelId } = data;
  const step = STEPS[Math.min(currentStep, STEPS.length - 1)];

  return (
    <div className="w-full space-y-8">
      <ol className="flex items-center gap-2" aria-label="Onboarding progress">
        {STEPS.map((item, index) => (
          <li
            key={item.title}
            data-done={index < currentStep}
            data-current={index === currentStep}
            aria-current={index === currentStep ? "step" : undefined}
            className="h-1.5 flex-1 rounded-full bg-muted data-[current=true]:bg-primary data-[done=true]:bg-primary/60"
          >
            <span className="sr-only">{item.title}</span>
          </li>
        ))}
      </ol>

      <div className="space-y-1">
        <p className="text-sm text-muted-foreground">
          Step {currentStep + 1} of {STEPS.length}
        </p>
        <h1 className="text-2xl font-bold">{step.title}</h1>
        <p className="text-sm text-muted-foreground">{step.description}</p>
      </div>

      {organizationSlug === null ? (
        <Skeleton className="h-40 w-full" />
      ) : (
        <>
          {currentStep === 0 && (
            <InviteMemberFormStep
              orgSlug={organizationSlug}
              hasInvited={data.step > 0}
              onLeaveStep={() => setHasLeftInvite(true)}
            />
          )}
          {currentStep === 1 && (
            <CreateChannelStepForm orgSlug={organizationSlug} />
          )}
          {currentStep >= 2 &&
            (channelId === null ? (
              <Skeleton className="h-40 w-full" />
            ) : (
              <AddIntegrationStep
                orgSlug={organizationSlug}
                channelId={channelId}
              />
            ))}
        </>
      )}
    </div>
  );
}
