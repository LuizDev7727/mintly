import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createFileRoute } from "@tanstack/react-router";
import { UserRoundPlus, UserRoundSearch } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { MemberCard } from "./-components/member-card";

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
    <div className="space-y-4 h-full">
      <div className="flex items-start justify-between gap-x-2">
        <div>
          <h1 className="text-xl font-medium">Members</h1>
          <p className="text-muted-foreground text-sm">
            Manage organization members
          </p>
        </div>
        <form className="space-y-4">
          <div className="flex items-center gap-x-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                className="w-full"
                placeholder="johndoe@gmail.com"
                type="email"
              />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <Input placeholder="role" type="email" />
            </div>
          </div>
          <Button type="button" className="w-full">
            <UserRoundPlus className="size-4" />
            Send Invite
          </Button>
        </form>
      </div>

      <Separator />

      <header className="flex items-center gap-x-2">
        <div className="*:not-first:mt-2 w-full">
          <div className="relative">
            <Input
              className="peer ps-9"
              placeholder="johndoe@gmail.com"
              type="email"
            />
            <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
              <UserRoundSearch aria-hidden="true" size={16} />
            </div>
          </div>
        </div>
        <Button
          data-current-tab={view === "members"}
          variant={"outline"}
          onClick={() => setView("members")}
          className="data-[current-tab=true]:bg-transparent!"
        >
          Members
        </Button>
        <Button
          data-current-tab={view === "pending"}
          variant="outline"
          onClick={() => setView("pending")}
          className="data-[current-tab=true]:bg-transparent!"
        >
          Pending
        </Button>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {view === "members" && <MemberCard />}
        {view === "pending" && <MemberCard pending />}
      </div>
    </div>
  );
}
