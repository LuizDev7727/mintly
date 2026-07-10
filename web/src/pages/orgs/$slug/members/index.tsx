import { useState } from "react";
import { createFileRoute, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { getMembersHttp } from "@/http/organization/get-members.http";
import { MemberCard } from "./-components/member-card";
import { EmptyPendingInvites } from "./-components/empty-pending-invites";
import { CreateInviteMemberForm } from "./-components/create-invite-member-form";
import { PendingInviteMemberCard } from "./-components/pending-invite-member-card";

export const Route = createFileRoute("/orgs/$slug/members/")({
  head: () => ({
    meta: [
      { title: "Members | Mintly" },
      { name: "description", content: "Organization members." },
    ],
  }),
  component: MembersPage,
});

type MemberView = "members" | "pending";

function MembersPage() {
  const [view, setView] = useState<MemberView>("members");

  const { slug } = useParams({ from: "/orgs/$slug" });

  const { data } = useQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
  });

  const members = data?.members ?? [];
  const pendingInvites = data?.pendingInvites ?? [];
  const isPendingInvitesEmpty = pendingInvites.length === 0;

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

      <div className="flex flex-col gap-4 h-full">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Input className="ps-9" placeholder="Search members..." />
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80">
              <Search size={16} aria-hidden="true" />
            </div>
          </div>
          <div className="flex items-center gap-1 rounded-md border p-1">
            <button
              onClick={() => setView("members")}
              className={cn(
                "rounded px-3 py-1 text-sm transition-colors",
                view === "members"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Members ({members.length})
            </button>
            <button
              onClick={() => setView("pending")}
              className={cn(
                "rounded px-3 py-1 text-sm transition-colors",
                view === "pending"
                  ? "bg-accent text-accent-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              Pending ({pendingInvites.length})
            </button>
          </div>
        </div>

        {view === "members" && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {members.map((member) => (
              <MemberCard key={member.id} member={member} />
            ))}
          </div>
        )}

        {view === "pending" &&
          (isPendingInvitesEmpty ? (
            <EmptyPendingInvites />
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {pendingInvites.map((invite) => (
                <PendingInviteMemberCard
                  key={invite.id}
                  inviteMember={invite}
                />
              ))}
            </div>
          ))}
      </div>
    </div>
  );
}
