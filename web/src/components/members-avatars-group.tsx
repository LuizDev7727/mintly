import { useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getMembersHttp } from "@/http/organization/get-members.http";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getInitials } from "@/utils/get-initials";

const MAX_VISIBLE_MEMBERS = 4;

export function MembersAvatarsGroup() {
  const { slug } = useParams({ from: "/orgs/$slug" });

  const { data } = useQuery({
    queryKey: ["members", slug],
    queryFn: () => getMembersHttp({ orgSlug: slug }),
    refetchOnWindowFocus: false,
  });

  if (!data) {
    return;
  }

  const visibleMembers = data.members.slice(0, MAX_VISIBLE_MEMBERS);
  const remainingCount = data.members.length - visibleMembers.length;

  return (
    <AvatarGroup>
      {visibleMembers.map((member) => (
        <Tooltip key={member.id}>
          <TooltipTrigger asChild>
            <Avatar size="sm">
              {member.user.avatarUrl && (
                <AvatarImage className="border border-input" src={member.user.avatarUrl} />
              )}
              <AvatarFallback>
                {getInitials(member.user.name)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{member.user.name}</TooltipContent>
        </Tooltip>
      ))}

      {remainingCount > 0 && (
        <AvatarGroupCount>+{remainingCount}</AvatarGroupCount>
      )}
    </AvatarGroup>
  );
}
