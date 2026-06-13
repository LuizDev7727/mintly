import { Link } from "@tanstack/react-router";
import { ChevronsUpDown, PlusCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth";

export function OrganizationSwitcher() {
  // const { data: activeOrganization } = authClient.useActiveOrganization();

  // console.log({ activeOrganization });
  const { data: organizations, isPending: isLoading } =
    authClient.useListOrganizations();

  if (!organizations) {
    return null;
  }

  const currentOrg = {
    id: "1",
    name: "Acme Inc",
    slug: "acme",
    image: null,
  };

  if (isLoading) {
    return <Skeleton className="h-6 w-40" />;
  }

  if (!currentOrg) return null;

  function handleSetSelectedOrg(orgSlug: string) {
    console.log({ orgSlug });
  }

  return (
    <div className="w-40 flex items-center justify-between gap-1">
      <Link to={`/`} className="w-full hover:underline">
        <span className="truncate text-left text-sm font-medium">
          {currentOrg.name}
        </span>
      </Link>

      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-50">
          {organizations.map((org) => (
            <DropdownMenuItem
              key={org.id}
              onClick={() => handleSetSelectedOrg(org.slug)}
            >
              {org.name}
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <button className="w-full cursor-pointer">
              <PlusCircle className="mr-2 size-4" />
              Create new
            </button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
