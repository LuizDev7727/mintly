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
  const unreadCount = 4;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative size-8 rounded-full text-muted-foreground shadow-none"
          size="icon"
          variant="ghost"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <div
              aria-hidden="true"
              className="absolute top-0.5 right-0.5 size-1 rounded-full bg-primary"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-1">
        <div className="flex items-baseline justify-between gap-4 px-3 py-2">
          <div className="font-semibold text-sm">Notifications</div>
          {unreadCount > 0 && (
            <button
              className="font-medium text-xs hover:underline"
              // onClick={handleMarkAllAsRead}
              type="button"
            >
              Mark all as read
            </button>
          )}
        </div>
        <div
          aria-orientation="horizontal"
          className="-mx-1 my-1 h-px bg-border"
          role="separator"
          tabIndex={-1}
        />
        {invites.map((notification) => (
          <div
            key={notification.id}
            className="z-50 max-w-100 rounded-md border bg-background p-4 shadow-lg"
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
        ))}
      </PopoverContent>
    </Popover>
  );
}
