import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Spinner } from "@/components/ui/spinner";
import { Bell, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { getInitials } from "@/utils/get-initials";
import { dayjs } from "@/lib/dayjs";
import { Separator } from "./ui/separator";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getPendingInvitesHttp,
  type GetPendingInvitesResponse,
} from "@/http/invitation/get-pending-invites.http";
import { acceptInviteHttp } from "@/http/invitation/accept-invite.http";
import { declineInviteHttp } from "@/http/invitation/decline-invite.http";
import { Badge } from "./ui/badge";

export function PendingInvites() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-invites"],
    queryFn: getPendingInvitesHttp,
  });

  const invites = data?.invites ?? [];

  const isPendingInvitesEmpty = invites.length === 0;

  const unreadCount = invites.length;

  const {
    mutate: handleAccept,
    isPending: isAccepting,
    variables: acceptVariables,
  } = useMutation({
    mutationFn: acceptInviteHttp,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<GetPendingInvitesResponse>(
        ["pending-invites"],
        (old) => {
          if (!old) return old;

          return {
            invites: old.invites.filter(
              (invite) => invite.id !== variables.inviteId,
            ),
          };
        },
      );
      queryClient.invalidateQueries({ queryKey: ["organizations"] });
    },
  });

  const {
    mutate: handleDecline,
    isPending: isDeclining,
    variables: declineVariables,
  } = useMutation({
    mutationFn: declineInviteHttp,
    onSuccess: (_, variables) => {
      queryClient.setQueryData<GetPendingInvitesResponse>(
        ["pending-invites"],
        (old) => {
          if (!old) return old;

          return {
            invites: old.invites.filter(
              (invite) => invite.id !== variables.inviteId,
            ),
          };
        },
      );
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          aria-label="Open notifications"
          className="relative"
          disabled={isLoading}
          size="icon-sm"
          variant="ghost"
        >
          <Bell size={16} />
          {unreadCount > 0 && (
            <Badge className="-top-2 -translate-x-1/2 absolute left-full min-w-5 px-1">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ml-4 p-1">
        <div className="flex items-baseline justify-between px-3 pt-2">
          <div className="font-semibold text-sm">Pending Invites</div>
        </div>
        <Separator />
        {isPendingInvitesEmpty ? (
          <div className="p-4 pt-0">
            <p className="text-muted-foreground">No pending invites</p>
          </div>
        ) : (
          invites.map((notification) => {
            const isAcceptingThis =
              isAccepting && acceptVariables?.inviteId === notification.id;
            const isDecliningThis =
              isDeclining && declineVariables?.inviteId === notification.id;
            const isProcessing = isAcceptingThis || isDecliningThis;

            return (
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
                      <Button
                        size="sm"
                        disabled={isProcessing}
                        onClick={() =>
                          handleAccept({ inviteId: notification.id })
                        }
                      >
                        {isAcceptingThis ? <Spinner /> : "Accept"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={isProcessing}
                        onClick={() =>
                          handleDecline({ inviteId: notification.id })
                        }
                      >
                        {isDecliningThis ? <Spinner /> : "Decline"}
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
            );
          })
        )}
      </PopoverContent>
    </Popover>
  );
}
