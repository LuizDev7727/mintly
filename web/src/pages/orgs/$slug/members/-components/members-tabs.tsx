import { Suspense } from "react";
import { Mail, Search, Users } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MembersList } from "./members-list";
import { MembersListLoading } from "./members-list-loading";
import { PendingInvitesList } from "./pending-invites-list";
import { PendingInvitesListLoading } from "./pending-invites-list-loading";

const TAB_TRIGGER_CLASS = [
  // The visible sides need a colour; the bottom stays transparent because the
  // list draws its own line under the tabs.
  "overflow-hidden rounded-b-none border-x border-t border-x-border border-t-border bg-muted py-2",
  // The active tab sits above that line and has no shadow.
  "data-[state=active]:z-10 group-data-[variant=default]/tabs-list:data-active:shadow-none",
  // Dark mode: keep the bottom open and the background solid.
  "dark:data-active:border-transparent dark:data-active:border-x-border dark:data-active:border-t-border dark:data-active:bg-background",
].join(" ");

export function MembersTabs() {
  return (
    <Tabs defaultValue="members" className="gap-4">
      <TabsList className="relative group-data-horizontal/tabs:h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px before:bg-border">
        <TabsTrigger className={TAB_TRIGGER_CLASS} value="members">
          <Users aria-hidden="true" className="opacity-60" />
          Members
        </TabsTrigger>
        <TabsTrigger className={TAB_TRIGGER_CLASS} value="pending">
          <Mail aria-hidden="true" className="opacity-60" />
          Pending
        </TabsTrigger>
      </TabsList>

      <div className="relative">
        <Input className="ps-9" placeholder="Search members..." />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80">
          <Search size={16} aria-hidden="true" />
        </div>
      </div>

      <TabsContent value="members">
        <Suspense fallback={<MembersListLoading />}>
          <MembersList />
        </Suspense>
      </TabsContent>

      <TabsContent value="pending">
        <Suspense fallback={<PendingInvitesListLoading />}>
          <PendingInvitesList />
        </Suspense>
      </TabsContent>
    </Tabs>
  );
}
