import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Crown, Mail, MoreHorizontal, UserRoundX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Member } from "@/types/member";
import { getInitials } from "@/utils/get-initials";

interface MemberCardProps {
  member: Member;
}

export function MemberCard({ member }: MemberCardProps) {
  const isOwner = member.role === "owner";
  return (
    <div className="w-90 rounded-md p-4 border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="relative">
            <Avatar className={"data-[pending=true]:opacity-60"}>
              {member.user.avatarUrl && (
                <AvatarImage src={member.user.avatarUrl} />
              )}
              <AvatarFallback>{getInitials(member.user.name)}</AvatarFallback>
            </Avatar>
          </div>
          <div>
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
          </div>
        </div>
        {!isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex justify-end">
                <Button
                  className="bg-transparent!"
                  variant={"outline"}
                  size={"sm"}
                >
                  <MoreHorizontal />
                </Button>
              </div>
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
      <div className="flex items-center justify-between"></div>
    </div>
  );
}
