import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, Mail, MoreHorizontal, UserRoundX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Member } from "@/types/member";
import { getInitials } from "@/utils/get-initials";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const isOwner = member.role === "owner";
  return (
    <div className="w-90 rounded-md p-4 border">
      <div className="flex items-start justify-between gap-x-2">
        <div className="flex items-start gap-x-2 min-w-0">
          <Avatar className={"data-[pending=true]:opacity-60"}>
            {member.user.avatarUrl && (
              <AvatarImage src={member.user.avatarUrl} />
            )}
            <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-x-2">
              <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
                {member.user.name}
              </h3>
              {isOwner && <Crown className="size-3 shrink-0" />}
            </div>
            <div className="flex mt-0.5 items-center text-xs text-muted-foreground gap-x-0.5">
              <Mail className="size-3 shrink-0" />
              <p className="truncate line-clamp-1">{member.user.email}</p>
            </div>
            {member.user.bio && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="mt-1 text-sm text-muted-foreground line-clamp-2 cursor-default">
                    {member.user.bio}
                  </p>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-64">
                  {member.user.bio}
                </TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                className="bg-transparent! shrink-0"
                variant={"outline"}
                size={"sm"}
              >
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                disabled={isOwner}
                className="text-destructive focus:text-destructive"
              >
                <UserRoundX className="size-3" />
                <span>Delete</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </div>
  );
}
