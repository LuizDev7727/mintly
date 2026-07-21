import { Link } from "@tanstack/react-router";
import { Building, ChevronsUpDown, PlusCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuShortcut,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "./ui/sidebar";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrganizationsHttp } from "@/http/organization/get-organizations.http";
import { getActiveOrganizationHttp } from "@/http/organization/get-active-organization.http";
import { setActiveOrganizationHttp } from "@/http/organization/set-active-organization.http";
import { CreateOrganizationForm } from "./create-organization-form";
import { Avatar, AvatarImage } from "./ui/avatar";

export function OrganizationSwitcher() {

  const queryClient = useQueryClient();
  const { isMobile } = useSidebar();

  const { data: currentOrg } = useQuery({
    queryKey: ["active-organization"],
    queryFn: getActiveOrganizationHttp,
    refetchOnWindowFocus: false,
  });

  const { data, isPending: isLoading } = useQuery({
    queryKey: ["organizations"],
    queryFn: getOrganizationsHttp,
    enabled: !!currentOrg,
    refetchOnWindowFocus: false,
  });

  const { mutateAsync: setSelectedOrg } = useMutation({
    mutationFn: setActiveOrganizationHttp,
    onSuccess: (_, variables) => {
      const { organizationSlug } = variables;

      queryClient.setQueryData(["active-organization"], () => {
        const selectedOrg = organizations.find(
          (org) => org.slug === organizationSlug,
        );
        return { organization: selectedOrg };
      });
    },
  });

  if (!data) {
    return null;
  }

  if (isLoading) {
    return <Skeleton className="h-6 w-40" />;
  }

  if (!currentOrg) return null;

  const { organizations } = data;
  const { organization } = currentOrg;

  async function handleSetSelectedOrg(organizationSlug: string) {
    await setSelectedOrg({ organizationSlug });
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              {organization.logo ?
                <Avatar>
                  <AvatarImage src={organization.logo} />
                </Avatar> :
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <Building className="size-4" />
                </div>
              }
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {organization.name}'s workspace
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {organization.membersCount} members
                </span>
              </div>
              <ChevronsUpDown className="ml-auto" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {organizations.map((org) => (
              <DropdownMenuItem
                key={org.name}
                onClick={() => handleSetSelectedOrg(org.slug)}
                className="gap-2 p-2 cursor-pointer"
                asChild
              >
                <Link to={"/orgs/$slug"} params={{ slug: org.slug }}>
                  <div className="flex size-6 items-center justify-center rounded-md border">
                    <Building className="size-3.5 shrink-0" />
                  </div>
                  {org.name}
                  <DropdownMenuShortcut>FREE</DropdownMenuShortcut>
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-2 p-2 cursor-pointer w-full">
                  <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                    <PlusCircle className="size-4" />
                  </div>
                  <p className="text-muted-foreground font-medium">
                    Create new
                  </p>
                </button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Organization</DialogTitle>
                  <DialogDescription>
                    This action cannot be undone. This will permanently delete
                    your account and remove your data from our servers.
                  </DialogDescription>
                </DialogHeader>
                <CreateOrganizationForm />
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
