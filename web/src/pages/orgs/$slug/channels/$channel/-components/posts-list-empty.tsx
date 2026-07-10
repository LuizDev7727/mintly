import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Image } from "lucide-react";
import { useQueryState } from "nuqs";

export function PostsListEmpty() {
  const [currentFolderName] = useQueryState("folder_name");
  const [titleFilter] = useQueryState("title_filter");

  const isRootFolder = currentFolderName === null;

  return (
    <Empty className="h-full">
      <EmptyHeader>
        <EmptyMedia>
          <Image className="size-4" />
        </EmptyMedia>
        {isRootFolder ? (
          <EmptyTitle>No posts yet</EmptyTitle>
        ) : (
          <EmptyTitle>This folder is empty</EmptyTitle>
        )}
        {isRootFolder && (
          <EmptyDescription>
            This channel doesn&apos;t have any posts yet
            {titleFilter && ` matching "${titleFilter}"`}.
          </EmptyDescription>
        )}
        {!isRootFolder && (
          <EmptyDescription>
            No posts found in{" "}
            <span className="font-semibold">{currentFolderName}</span>
            {titleFilter && ` matching "${titleFilter}"`}.{" "}
          </EmptyDescription>
        )}
      </EmptyHeader>
    </Empty>
  );
}
