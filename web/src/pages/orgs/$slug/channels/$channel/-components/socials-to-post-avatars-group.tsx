import type { Post } from "@/types/post";
import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { getInitials } from "@/utils/get-initials";

type SocialsToPostAvatarsGroupProps = {
  socialsToPost: Post["socialsToPost"]
}

export function SocialsToPostAvatarsGroup({ socialsToPost }:SocialsToPostAvatarsGroupProps) {
  return (
    <AvatarGroup>
      {socialsToPost.map((socialToPost) => (
        <Tooltip key={socialToPost.id}>
          <TooltipTrigger asChild>
            <Avatar size="sm">
              {socialToPost.avatarUrl && (
                <AvatarImage src={socialToPost.avatarUrl} />
              )}
              <AvatarFallback>
                {getInitials(socialToPost.socialName)}
              </AvatarFallback>
            </Avatar>
          </TooltipTrigger>
          <TooltipContent>{socialToPost.socialName}</TooltipContent>
        </Tooltip>
      ))}
    </AvatarGroup>
  )
}
