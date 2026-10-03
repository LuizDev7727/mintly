import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { GetPostResponse } from "@/http/posts/get-post.http";
import { dayjs } from "@/lib/dayjs";
import { POST_NETWORK_ICONS } from "@/pages/orgs/$slug/channels/$channel/-components/post-network-icons";
import { PostStatusBadge } from "@/pages/orgs/$slug/channels/$channel/-components/post-status-badge";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { getInitials } from "@/utils/get-initials";
import { Link, useParams } from "@tanstack/react-router";
import { Folder, Image } from "lucide-react";
import { VideoCard } from "./video-card";
import { PostBestMoments } from "./post-best-moments";

// TODO: remover — tags fictícias até o post ter tags de verdade.
const MOCK_TAGS = [
  "inteligenciaartificial",
  "programação",
  "desenvolvimentodesoftware",
  "development",
  "programador",
  "claudecode",
  "openai",
];

// TODO: remover — vídeo fictício até a API devolver a URL assinada do vídeo do post.
const MOCK_VIDEO_URL =
  "";

const fieldClassName =
  "rounded-xl border border-border bg-card px-4 pt-2.5 pb-4 dark:bg-zinc-900/20";

type PostDetailsProps = {
  post: GetPostResponse;
};

export function PostDetails({ post }: PostDetailsProps) {
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel/$postId/",
  });

  const isVideo = post.mimeType === "video/mp4";
  const hasThumbnail = post.thumbnailUrl !== null;
  const hasDescription = post.description.trim().length > 0;
  const hasSocials = post.socialsToPost.length > 0;

  return (
    <div className="space-y-6">
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="min-w-0 space-y-6">
        <section className={fieldClassName}>
          <p className="text-xs text-muted-foreground">Title</p>
          <h2 className="mt-1 text-base font-medium">{post.title}</h2>
        </section>

        <section className={fieldClassName}>
          <p className="text-xs text-muted-foreground">Description</p>
          {hasDescription ? (
            <p className="mt-1 whitespace-pre-line text-sm leading-relaxed">
              {post.description}
            </p>
          ) : (
            <p className="mt-1 text-sm text-muted-foreground">
              No description
            </p>
          )}
        </section>

        <section className={fieldClassName}>
          <p className="text-xs text-muted-foreground">Tags</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {MOCK_TAGS.map((tag) => (
              <Badge key={tag} variant="secondary" className="rounded-md">
                #{tag}
              </Badge>
            ))}
          </div>
        </section>

        {isVideo && (
          <section className={fieldClassName}>
            <h3 className="text-sm font-medium">Thumbnail</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              The cover image that represents this post.
            </p>
            <div className="mt-3 aspect-video w-44 overflow-hidden rounded-lg border border-dashed border-border p-1">
              {hasThumbnail ? (
                <img
                  src={post.thumbnailUrl ?? ""}
                  alt="Post thumbnail"
                  className="size-full rounded-md object-cover"
                />
              ) : (
                <div className="flex size-full items-center justify-center rounded-md bg-muted text-muted-foreground">
                  <Image size={24} strokeWidth={1.5} />
                </div>
              )}
            </div>
          </section>
        )}
      </div>

      <aside className="min-w-0 space-y-6">
        <div className="overflow-hidden rounded-xl border border-border bg-card dark:bg-zinc-900/20">
          <div className="relative aspect-video w-full bg-muted">
            {isVideo ? (
              <VideoCard
                src={MOCK_VIDEO_URL}
                poster={post.thumbnailUrl ?? undefined}
              />
            ) : (
              <img
                src={post.thumbnailUrl ?? ""}
                alt="Post thumbnail"
                className="size-full object-cover"
              />
            )}
          </div>

          <div className="space-y-4 p-4">
            <dl className="space-y-3">
              <div>
                <dt className="text-xs text-muted-foreground">Size</dt>
                <dd className="text-sm">{formatBytes(post.size)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Type</dt>
                <dd className="text-sm">{post.mimeType}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Duration</dt>
                <dd className="text-sm">{formatDuration(post.duration)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted-foreground">Created at</dt>
                <dd className="text-sm">
                  {dayjs(post.createdAt).format("MMM D, YYYY")}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">Folder</dt>
                <dd className="text-sm">
                  {post.folder ? (
                    <Link
                      to="/orgs/$slug/channels/$channel"
                      params={{ slug, channel }}
                      search={{
                        folder_id: post.folder.id,
                        folder_name: post.folder.title,
                      }}
                      className="inline-flex max-w-full items-center gap-1.5 hover:underline"
                    >
                      <Folder className="size-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{post.folder.title}</span>
                    </Link>
                  ) : (
                    <span>Root</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="mb-1 text-xs text-muted-foreground">Status</dt>
                <dd>
                  <PostStatusBadge status={post.status} />
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <section className={fieldClassName}>
          <p className="text-xs text-muted-foreground">Owner</p>
          <div className="mt-2 flex items-center gap-2.5">
            <Avatar className="size-6">
              {post.author.avatarUrl && (
                <AvatarImage
                  src={post.author.avatarUrl}
                  alt={post.author.name}
                />
              )}
              <AvatarFallback className="text-xs">
                {getInitials(post.author.name)}
              </AvatarFallback>
            </Avatar>
            <p className="truncate text-sm font-medium">{post.author.name}</p>
          </div>
        </section>

        {hasSocials && (
          <section className={fieldClassName}>
            <p className="text-xs text-muted-foreground">Posted to</p>
            <div className="mt-2 flex flex-col gap-1.5">
              {post.socialsToPost.map((social) => (
                <div
                  key={social.socialName}
                  className="flex items-center gap-2 rounded-lg border px-2.5 py-2"
                >
                  {POST_NETWORK_ICONS[social.social]}
                  <p className="text-xs">{social.socialName}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </aside>
    </div>

      {isVideo && <PostBestMoments />}
    </div>
  );
}
