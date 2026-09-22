import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { createInviteMemberHttp } from "@/http/organization/create-invite-member.http";
import {
  createInviteMemberSchema,
  type CreateInviteMemberFormType,
} from "@/schemas/organization/create-invite-member.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { UserRoundPlus } from "lucide-react";
import { useForm } from "react-hook-form";

export function CreateInviteMemberForm() {
  const { slug } = useParams({ from: "/orgs/$slug" });
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<CreateInviteMemberFormType>({
    resolver: zodResolver(createInviteMemberSchema),
    defaultValues: {
      email: "",
    },
  });

  const { mutateAsync: handleCreateInvite } = useMutation({
    mutationFn: createInviteMemberHttp,
    onSuccess: () => {
      // The invite always lands on page 1 (most recent first), which may not
      // be the page a cached query is showing — refetch instead of patching
      // the list by hand. Both prefixes: every cached page, and the count
      // that feeds the "Pending" tab label.
      queryClient.invalidateQueries({
        queryKey: ["organization-pending-invites", slug],
      });
      queryClient.invalidateQueries({
        queryKey: ["organization-pending-invites-count", slug],
      });
    },
  });

  async function onSubmit(formBody: CreateInviteMemberFormType) {
    const { email } = formBody;
    await handleCreateInvite({ orgSlug: slug, email });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-4">
      <Label>Email Address</Label>
      <Input
        type="email"
        placeholder="jane@example.com"
        className="w-full"
        {...register("email")}
      />
      <Button size="sm" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? <Spinner /> : <UserRoundPlus className="size-4" />}
        Send Invite
      </Button>
    </form>
  );
}
