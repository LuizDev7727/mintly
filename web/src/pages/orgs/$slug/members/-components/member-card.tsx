import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Clock, Mail, MoreHorizontal, User, UserRoundX } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface MemberCardProps {
  pending?: boolean;
}

export function MemberCard({ pending = false }: MemberCardProps) {
  return (
    <div className="w-90 space-y-4 rounded-md p-4 border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <div className="relative">
            <Avatar
              data-pending={pending}
              className={"data-[pending=true]:opacity-60"}
            >
              <AvatarImage src="https://github.com/LuizDev7727.png" />
              <AvatarFallback>LA</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <h3 className="truncate text-sm font-semibold leading-tight text-foreground">
              Luiz Antonio
            </h3>
            <div className="flex mt-0.5 items-center text-xs text-muted-foreground gap-x-0.5">
              <Mail className="size-3 shrink-0" />
              <p className="truncate line-clamp-1">
                luiz.antonioq2003@gmail.com
              </p>
            </div>
          </div>
        </div>
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
            <DropdownMenuItem className="text-destructive focus:text-destructive">
              <UserRoundX className="size-3" />
              <span>Delete</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Separator />
      <div className="flex items-center justify-between">
        {pending ? (
          <Badge variant={"outline"}>
            <Clock className="size-3" />
            Waiting for approval
          </Badge>
        ) : (
          <Badge variant={"outline"}>
            <User className="size-3" />
            Member
          </Badge>
        )}

        {pending && (
          <p className="flex items-center gap-x-1 text-xs text-muted-foreground">
            Há 5 min
          </p>
        )}
      </div>
    </div>
  );
}
