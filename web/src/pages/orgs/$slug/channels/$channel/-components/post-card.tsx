import { Button } from "@/components/ui/button";
import { Image, MoreVertical } from "lucide-react";

export function PostCard() {
  const isMp4File = false;
  // More than 60 seconds because reels/shorts does not have thumbnail
  const hasDurationMoreThan60Seconds = false;
  const canGenerateThumbnail = isMp4File && hasDurationMoreThan60Seconds;
  return (
    <div className="w-full rounded-xl overflow-hidden border bg-card">
      <div className="relative aspect-video bg-zinc-900/20">
        {/*<img
          src="https://placehold.co/320x180/1a1a1a/888888"
          alt="Post thumbnail"
          className="w-full h-full object-cover"
        />*/}
        <div className="w-full h-full flex flex-col items-center justify-center">
          <Image className="size-4" />
          {!canGenerateThumbnail && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Can not generate thumbnail to this post.
            </p>
          )}
          {canGenerateThumbnail && (
            <Button variant={"link"} disabled={!canGenerateThumbnail}>
              Generate Thumbnail
            </Button>
          )}
        </div>
      </div>

      <div className="flex items-start gap-2 p-2">
        <div className="size-7 rounded-full bg-muted shrink-0 overflow-hidden">
          <img
            src="https://github.com/shadcn.png"
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-xs leading-snug line-clamp-2">
            My Latest Video Title
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Tessa Larks • 2 days ago
          </p>
        </div>

        <button className="shrink-0 text-muted-foreground hover:text-foreground">
          <MoreVertical className="size-3.5" />
        </button>
      </div>
    </div>
  );
}
