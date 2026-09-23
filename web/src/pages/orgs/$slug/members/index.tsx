import { createFileRoute } from "@tanstack/react-router";
import { CreateInviteMemberForm } from "./-components/create-invite-member-form";
import { MembersTabs } from "./-components/members-tabs";

export const Route = createFileRoute("/orgs/$slug/members/")({
  head: () => ({
    meta: [
      { title: "Members | Mintly" },
      { name: "description", content: "Organization members." },
    ],
  }),
  component: MembersPage,
});

function MembersPage() {
  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage team members and invitations
        </p>
      </div>

      <div className="rounded-md space-y-4 p-4 border dark:bg-zinc-900/20">
        <div>
          <h2 className="text-xl font-semibold">Invite members</h2>
          <p className="text-sm text-muted-foreground">
            Add new members to your organization by entering their email
            address.
          </p>
        </div>
        <CreateInviteMemberForm />
      </div>

      <MembersTabs />
    </div>
  );
}
