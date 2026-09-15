import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  AlertTriangle,
  Ban,
  Calendar,
  Check,
  Loader2,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { debounce, parseAsStringLiteral, useQueryState } from "nuqs";

const PROJECT_STATUSES = [
  "SUCCESS",
  "PROCESSING",
  "ENCODING",
  "ERROR",
  "CANCELED",
] as const;

const PROJECT_STATUS_ICONS = {
  SUCCESS: Check,
  PROCESSING: Loader2,
  ENCODING: Calendar,
  ERROR: AlertTriangle,
  CANCELED: Ban,
} as const;

export function ProjectsFilter() {
  const { slug } = useParams({ from: "/orgs/$slug/channels/$channel" });

  const [titleFilter, setTitleFilter] = useQueryState("title_filter", {
    defaultValue: "",
  });

  const [statusFilter, setStatusFilter] = useQueryState(
    "status_filter",
    parseAsStringLiteral(PROJECT_STATUSES),
  );

  const [ownerFilter, setOwnerFilter] = useQueryState("owner_filter");

  const { data } = useQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
    refetchOnWindowFocus: false,
  });

  const members = data?.members ?? [];

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.target;
    setTitleFilter(value, {
      limitUrlUpdates: value !== "" ? debounce(500) : undefined,
    });
  }

  function handleToggleStatus(status: (typeof PROJECT_STATUSES)[number]) {
    setStatusFilter(statusFilter === status ? null : status);
  }

  function handleToggleOwner(ownerId: string) {
    setOwnerFilter(ownerFilter === ownerId ? null : ownerId);
  }

  function handleResetFilter() {
    setTitleFilter("");
    setStatusFilter(null);
    setOwnerFilter(null);
  }

  const isFilterEmpty =
    titleFilter.length === 0 && !statusFilter && !ownerFilter;

  const activeFilterCount =
    (statusFilter ? 1 : 0) + (ownerFilter ? 1 : 0);

  return (
    <div className="flex items-center gap-x-2 flex-1">
      <div className="relative w-full">
        <Input
          className="peer ps-9"
          placeholder="Filter by name"
          type="search"
          value={titleFilter}
          onChange={handleInputChange}
        />
        <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
          <Search size={16} />
        </div>
      </div>

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
            <SheetTitle>Filter Projects</SheetTitle>
            <SheetDescription>
              Narrow down projects by status or owner.
            </SheetDescription>
          </SheetHeader>

          <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4">
            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Status
              </h4>
              <div className="flex flex-col gap-1.5">
                {PROJECT_STATUSES.map((status) => {
                  const StatusIcon = PROJECT_STATUS_ICONS[status];

                  return (
                    <button
                      key={status}
                      type="button"
                      data-selected={statusFilter === status}
                      onClick={() => handleToggleStatus(status)}
                      className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm transition-colors hover:bg-accent/50 data-[selected=true]:border-primary"
                    >
                      <StatusIcon
                        className={
                          status === "PROCESSING"
                            ? "size-4 animate-spin text-muted-foreground"
                            : "size-4 text-muted-foreground"
                        }
                      />
                      {status}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <h4 className="text-sm font-semibold text-foreground">
                Owner
              </h4>
              <div className="flex flex-col gap-1.5">
                {members.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    data-selected={ownerFilter === member.user.id}
                    onClick={() => handleToggleOwner(member.user.id)}
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
    </div>
  );
}
