import { Folder } from "lucide-react";

import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useQueryState } from "nuqs";

export function FoldersListEmpty() {
  const [currentFolderName] = useQueryState("folder_name");

  const isRootFolder = currentFolderName === null;
  return (
    <Empty className="h-full border border-dashed ">
      <EmptyHeader>
        <EmptyMedia variant="default">
          <Folder className="size-4" />
        </EmptyMedia>
        <EmptyTitle>No Folders Yet</EmptyTitle>
        <EmptyDescription>
          You haven&apos;t created any folders in{" "}
          <span className="font-semibold">
            {isRootFolder ? "this channel" : currentFolderName}
          </span>
          . Get started by creating your first folder.
        </EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}
