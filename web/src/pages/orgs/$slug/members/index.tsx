import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, UserRoundPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { MemberCard } from "./-components/member-card";
import { EmptyPendingInvites } from "./-components/empty-pending-invites";

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

  return (
    <div className="w-full flex flex-col gap-6 h-full">
      <div>
        <h1 className="text-xl font-semibold">Members</h1>
        <p className="text-sm text-muted-foreground">
          Manage team members and invitations
        </p>
      </div>

      <div className="rounded-md space-y-4 p-4 border bg-zinc-900/20">
        <div>
          <h2 className="text-xl font-semibold">Invite members</h2>
          <p className="text-sm text-muted-foreground">
            Add new members to your organization by entering their email
            address.
          </p>
        </div>
        <form className="w-full space-y-4">
          <Label>Email Address</Label>
          <Input
            type="email"
            placeholder="jane@example.com"
            className="w-full"
          />
          <Button size="sm" className="w-full">
            <UserRoundPlus className="size-4" />
            Send Invite
          </Button>
        </form>
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
              Members
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
              Pending
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {view === "members" && <MemberCard />}
        </div>

        {view === "pending" && <EmptyPendingInvites />}
      </div>
    </div>
  );
}
