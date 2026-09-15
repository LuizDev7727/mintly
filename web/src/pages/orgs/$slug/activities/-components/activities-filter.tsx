import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { getMembersHttp } from "@/http/organization/get-members.http";
import { getInitials } from "@/utils/get-initials";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { SlidersHorizontal, X } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { ACTIVITY_ACTIONS, ACTIVITY_ACTION_CONFIG } from "./activity-action-config";

export function ActivitiesFilter() {
  const { slug } = useParams({ from: "/orgs/$slug/activities/" });

  const [actionFilter, setActionFilter] = useQueryState(
    "action_filter",
    parseAsStringLiteral(ACTIVITY_ACTIONS),
  );

  const [authorFilter, setAuthorFilter] = useQueryState("author_filter");

  const { data } = useQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
    refetchOnWindowFocus: false,
  });

  const members = data?.members ?? [];

  function handleToggleAction(action: (typeof ACTIVITY_ACTIONS)[number]) {
    setActionFilter(actionFilter === action ? null : action);
  }

  function handleToggleAuthor(authorId: string) {
    setAuthorFilter(authorFilter === authorId ? null : authorId);
  }

  function handleResetFilter() {
    setActionFilter(null);
    setAuthorFilter(null);
  }

  const isFilterEmpty = !actionFilter && !authorFilter;

  const activeFilterCount = (actionFilter ? 1 : 0) + (authorFilter ? 1 : 0);

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline">
          <SlidersHorizontal className="size-4" />
          Filters
          {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Filter Activities</SheetTitle>
          <SheetDescription>
            Narrow down activities by action or author.
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4">
          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">Action</h4>
            <div className="flex flex-col gap-1.5">
              {ACTIVITY_ACTIONS.map((action) => {
                const ActionIcon = ACTIVITY_ACTION_CONFIG[action].icon;

                return (
                  <button
                    key={action}
                    type="button"
                    data-selected={actionFilter === action}
                    onClick={() => handleToggleAction(action)}
                    className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm capitalize transition-colors hover:bg-accent/50 data-[selected=true]:border-primary"
                  >
                    <ActionIcon className="size-4 text-muted-foreground" />
                    {ACTIVITY_ACTION_CONFIG[action].label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h4 className="text-sm font-semibold text-foreground">Author</h4>
            <div className="flex flex-col gap-1.5">
              {members.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  data-selected={authorFilter === member.user.id}
                  onClick={() => handleToggleAuthor(member.user.id)}
                  className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50 data-[selected=true]:border-primary"
                >
                  <Avatar size="sm">
                    {member.user.avatarUrl && (
                      <AvatarImage src={member.user.avatarUrl} />
                    )}
                    <AvatarFallback>
                      {getInitials(member.user.name)}
                    </AvatarFallback>
                  </Avatar>
                  {member.user.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <SheetFooter>
          <Button
            type="button"
            variant="destructive"
            disabled={isFilterEmpty}
            onClick={handleResetFilter}
          >
            <X className="size-4" />
            Clear all filters
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
