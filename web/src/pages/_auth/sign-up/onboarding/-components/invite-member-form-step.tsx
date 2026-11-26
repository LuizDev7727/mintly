import { Button } from "@/components/ui/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { skipOnboardingInviteHttp } from "@/http/onboarding/skip-onboarding-invite.http";
import { createInviteMemberHttp } from "@/http/organization/create-invite-member.http";
import type { GetOrganizationPendingInvitesResponse } from "@/http/organization/get-organization-pending-invites.http";
import {
  createInviteMemberSchema,
  type CreateInviteMemberFormType,
} from "@/schemas/organization/create-invite-member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UserRoundPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { InvitedMembersList } from "./invited-members-list";

type InviteMemberFormStepProps = {
  orgSlug: string;
  hasInvited: boolean;
  onLeaveStep: () => void;
};

export function InviteMemberFormStep({
  orgSlug,
  hasInvited,
  onLeaveStep,
}: InviteMemberFormStepProps) {
  const queryClient = useQueryClient();
  const invitesKey = ["onboarding-invites", orgSlug];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateInviteMemberFormType>({
    resolver: zodResolver(createInviteMemberSchema),
    defaultValues: { email: "" },
  });

  const { mutateAsync: handleCreateInvite, isPending: isInviting } =
    useMutation({
      mutationFn: createInviteMemberHttp,
      onMutate: async ({ email }) => {
        await queryClient.cancelQueries({ queryKey: invitesKey });

        const previous =
          queryClient.getQueryData<GetOrganizationPendingInvitesResponse>(
            invitesKey,
          );

        if (previous) {
          queryClient.setQueryData<GetOrganizationPendingInvitesResponse>(
            invitesKey,
            {
              ...previous,
              pendingInvites: [
                {
                  id: `optimistic-${email}`,
                  email,
                  role: null,
                  createdAt: new Date().toISOString(),
                },
                ...previous.pendingInvites,
              ],
            },
          );
        }

        return { previous };
      },
      onError: (_error, _variables, context) => {
        queryClient.setQueryData(invitesKey, context?.previous);
      },
      onSettled: () => {
        queryClient.invalidateQueries({ queryKey: ["onboarding"] });
        queryClient.invalidateQueries({ queryKey: invitesKey });
      },
    });

  const { mutateAsync: handleSkip, isPending: isSkipping } = useMutation({
    mutationFn: skipOnboardingInviteHttp,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["onboarding"] });
    },
  });

  async function onSubmit({ email }: CreateInviteMemberFormType) {
    await handleCreateInvite({ orgSlug, email });
    reset();
  }

  async function onSkip() {
    await handleSkip();
    onLeaveStep();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="invite-email">Email address</FieldLabel>
            <Input
              id="invite-email"
              type="email"
              placeholder="jane@example.com"
              {...register("email")}
            />
            {errors.email && <FieldError>{errors.email.message}</FieldError>}
          </Field>
        </FieldGroup>
        <Button type="submit" className="w-full" disabled={isInviting}>
          {isInviting ? <Spinner /> : <UserRoundPlus className="size-4" />}
          Send invite
        </Button>
      </form>

      <InvitedMembersList orgSlug={orgSlug} />

      {hasInvited ? (
        <Button className="w-full" onClick={onLeaveStep}>
          Continue
        </Button>
      ) : (
        <Button
          variant="ghost"
          className="w-full"
          disabled={isSkipping}
          onClick={onSkip}
        >
          {isSkipping && <Spinner />}
          {isSkipping ? "Skipping…" : "Skip for now"}
        </Button>
      )}
    </div>
  );
}
