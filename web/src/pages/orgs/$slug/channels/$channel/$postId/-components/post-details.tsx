import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getPostHttp } from "@/http/posts/get-post.http";
import { dayjs } from "@/lib/dayjs";
import { POST_NETWORK_ICONS } from "@/pages/orgs/$slug/channels/$channel/-components/post-network-icons";
import { PostStatusBadge } from "@/pages/orgs/$slug/channels/$channel/-components/post-status-badge";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { getInitials } from "@/utils/get-initials";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { Calendar, Clock, HardDrive, Image } from "lucide-react";

export function PostDetails() {
  const { postId } = useParams({
    from: "/orgs/$slug/channels/$channel/$postId/",
  });

  const { data: post } = useSuspenseQuery({
    queryKey: ["post", postId],
    queryFn: () => getPostHttp({ postId }),
  });

  const hasThumbnail = post.thumbnailUrl !== null;

  return (
    <div className="space-y-6">
      <div className="relative h-80 w-full overflow-hidden rounded-2xl bg-[#242424]">
        {hasThumbnail ? (
          <img
            src={post.thumbnailUrl ?? ""}
            alt="Post thumbnail"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#888888]">
            <Image size={40} strokeWidth={1.5} />
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold">{post.title}</h1>
          <div className="mt-1.5 flex items-center gap-2">
            <Avatar className="size-5 rounded-lg">
              {post.author.avatarUrl && (
                <AvatarImage
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                />
              )}
              <AvatarFallback className="rounded-lg text-[10px]">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <p className="text-sm text-muted-foreground">
              {post.author.name}
            </p>
          </div>
        </div>
        <PostStatusBadge status={post.status} />
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div>
          <p className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <HardDrive size={13} />
            Size
          </p>
          <p className="text-sm">{formatBytes(post.size)}</p>
        </div>
        <div>
          <p className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={13} />
            Duration
          </p>
          <p className="text-sm">{formatDuration(post.duration)}</p>
        </div>
        <div>
          <p className="mb-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar size={13} />
            Created At
          </p>
          <p className="text-sm">
            {dayjs(post.createdAt).format("MMM D, YYYY")}
          </p>
        </div>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-sm font-medium">Description</p>
        <p className="whitespace-pre-line text-sm text-muted-foreground">
          {post.description}
        </p>
      </div>

      <Separator />

      <div>
        <p className="mb-2 text-sm font-medium">Posted to</p>
        <div className="flex flex-col gap-1.5">
          {post.socialsToPost.map((social) => (
            <div
              key={social.socialName}
              className="flex items-center gap-2 rounded-[10px] border px-2.5 py-2"
            >
              {POST_NETWORK_ICONS[social.social]}
              <p className="text-xs">{social.socialName}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
