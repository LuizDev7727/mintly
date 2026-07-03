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
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <Image />
        </EmptyMedia>
        {isRootFolder && <EmptyTitle>No posts yet</EmptyTitle>}
        {!isRootFolder && <EmptyTitle>This folder is empty</EmptyTitle>}
        {isRootFolder && (
          <EmptyDescription>
            This channel doesn't have any posts yet.
            {titleFilter && `filter by "${titleFilter}"`}
          </EmptyDescription>
        )}
        {!isRootFolder && (
          <EmptyDescription>
            No posts found in "{currentFolderName}". Try another folder or
            {titleFilter && `filter by "${titleFilter}"`}
            move posts here.
          </EmptyDescription>
        )}
      </EmptyHeader>
    </Empty>
  );
}
