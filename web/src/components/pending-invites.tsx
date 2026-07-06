import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Bell, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/utils/get-initials";
import { dayjs } from "@/lib/dayjs";
import { SidebarMenuButton } from "./ui/sidebar";
import { Separator } from "./ui/separator";

export function PendingInvites() {
  const invites = [
    {
      id: "1",
      author: {
        name: "John Doe",
        avatarUrl: "https://avatars.githubusercontent.com/u/1?v=4",
      },
      organization: {
        name: "Mintly",
      },
      createdAt: new Date(),
    },
  ];

  const unreadCount = 1;

  const isPendingInvitesEmpty = invites.length === 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <SidebarMenuButton className="cursor-pointer" size="sm">
          <Bell />
          Pending Invites {unreadCount > 0 && `(${unreadCount})`}
        </SidebarMenuButton>
      </PopoverTrigger>
      <PopoverContent className="ml-4 p-1">
        <div className="flex items-baseline justify-between px-3 pt-2">
          <div className="font-semibold text-sm">Notifications</div>
        </div>
        <Separator />
        {isPendingInvitesEmpty ? (
          <div>No pending invites</div>
        ) : (
          invites.map((notification) => (
            <div
              key={notification.id}
              className="z-50 max-w-100 rounded-md p-2 shadow-lg"
            >
              <div className="flex gap-3">
                <Avatar>
                  {notification.author.avatarUrl && (
                    <AvatarImage src={notification.author.avatarUrl} />
                  )}
                  <AvatarFallback>
                    {getInitials(notification.author.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex grow flex-col gap-3">
                  <div className="space-y-1">
                    <p className="text-muted-foreground text-sm">
                      <a
                        className="font-medium text-foreground hover:underline"
                        href="#"
                      >
                        {notification.author.name}
                      </a>{" "}
                      mentioned you in{" "}
                      <a
                        className="font-medium text-foreground hover:underline"
                        href="#"
                      >
                        {notification.organization.name}
                      </a>
                      .
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {dayjs(notification.createdAt).fromNow()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm">Accept</Button>
                    <Button size="sm" variant="outline">
                      Decline
                    </Button>
                  </div>
                </div>
                <Button
                  aria-label="Close notification"
                  className="group -my-1.5 -me-2 size-8 shrink-0 p-0 hover:bg-transparent"
                  variant="ghost"
                >
                  <X
                    aria-hidden="true"
                    className="opacity-60 transition-opacity group-hover:opacity-100"
                    size={16}
                  />
                </Button>
              </div>
            </div>
          ))
        )}
      </PopoverContent>
    </Popover>
  );
}
