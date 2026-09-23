import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoveToFolderButton } from "./move-to-folder-button";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import {
  AlertTriangle,
  Ban,
  Calendar,
  Check,
  Loader2,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  debounce,
  parseAsString,
  parseAsStringLiteral,
  useQueryState,
} from "nuqs";
import type { ChangeEvent } from "react";

const POST_STATUSES = [
  "PROCESSING",
  "SCHEDULED",
  "ERROR",
  "PUBLISHED",
  "ENCODING",
  "GENERATING_METADATA",
  "GENERATING_THUMBNAIL",
  "TRANSCRIBING",
  "SEO_GENERATING",
  "PUBLISHING",
  "CANCELED",
] as const;

const POST_STATUS_ICONS: Record<(typeof POST_STATUSES)[number], LucideIcon> = {
  PUBLISHED: Check,
  ERROR: AlertTriangle,
  SCHEDULED: Calendar,
  CANCELED: Ban,
  PROCESSING: Loader2,
  ENCODING: Loader2,
  GENERATING_METADATA: Loader2,
  GENERATING_THUMBNAIL: Loader2,
  TRANSCRIBING: Loader2,
  SEO_GENERATING: Loader2,
  PUBLISHING: Loader2,
};

export function PostsFilter() {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const queryClient = useQueryClient();

  const [title, setTitle] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  const [statusFilter, setStatusFilter] = useQueryState(
    "status_filter",
    parseAsStringLiteral(POST_STATUSES),
  );

  const [ownerFilter, setOwnerFilter] = useQueryState("owner_filter");

  const { data } = useQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
    refetchOnWindowFocus: false,
  });

  const members = data?.members ?? [];

  function handleReload() {
    queryClient.invalidateQueries({
      queryKey: ["posts", slug, channel],
    });
  }

  function handleTitleChange(event: ChangeEvent<HTMLInputElement>) {
    setTitle(event.target.value, {
      limitUrlUpdates: event.target.value !== "" ? debounce(500) : undefined,
    });
  }

  function handleToggleStatus(status: (typeof POST_STATUSES)[number]) {
    setStatusFilter(statusFilter === status ? null : status);
  }

  function handleToggleOwner(ownerId: string) {
    setOwnerFilter(ownerFilter === ownerId ? null : ownerId);
  }

  function handleResetFilter() {
    setTitle("");
    setStatusFilter(null);
    setOwnerFilter(null);
  }

  const isFilterEmpty =
    title.length === 0 && !statusFilter && !ownerFilter;

  const activeFilterCount = (statusFilter ? 1 : 0) + (ownerFilter ? 1 : 0);

  return (
    <div className="flex flex-col gap-2 w-full sm:flex-row sm:items-center sm:gap-x-2">
      <div className="*:not-first:mt-2 w-full sm:flex-1">
        <div className="relative w-full">
          <Input
            className="peer ps-9 w-full"
            id={"filter_name"}
            placeholder="Filter by Name"
            value={title}
            type="text"
            onChange={handleTitleChange}
          />
          <div className="pointer-events-none absolute inset-y-0 inset-s-0 flex items-center justify-center ps-3 text-muted-foreground/80 peer-disabled:opacity-50">
            <Search aria-hidden="true" size={16} />
          </div>
        </div>
      </div>

      <div className="flex w-full items-center gap-2 sm:w-auto">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="flex-1">
              <SlidersHorizontal className="size-4" />
              Filters
              {activeFilterCount > 0 && <Badge>{activeFilterCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>Filter Posts</SheetTitle>
              <SheetDescription>
                Narrow down posts by status or owner.
              </SheetDescription>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-6 overflow-y-auto px-4">
              <div className="flex flex-col gap-2">
                <h4 className="text-sm font-semibold text-foreground">
                  Status
                </h4>
                <div className="flex flex-col gap-1.5">
                  {POST_STATUSES.map((status) => {
                    const StatusIcon = POST_STATUS_ICONS[status];

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
                            status === "PUBLISHED" ||
                            status === "ERROR" ||
                            status === "SCHEDULED" ||
                            status === "CANCELED"
                              ? "size-4 text-muted-foreground"
                              : "size-4 animate-spin text-muted-foreground"
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

        <Button onClick={handleReload} className="flex-1">
          <RotateCcw className="size-4" />
          Reload
        </Button>

        <MoveToFolderButton />
      </div>
    </div>
  );
}
