import { FolderIcon, MoreHorizontal, Star } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder } from "@/types/folder";
import { useQueryState } from "nuqs";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { StarFolderButton } from "./star-folder-button";
import { UpdateFolderNameDialog } from "./update-folder-name-dialog";

type FolderCardProps = {
  folder: Folder;
};

export function FolderCard({ folder }: FolderCardProps) {
  const [_, setSelectedFolder] = useQueryState("folder_id");
  const [_currentFolderName, setSelectedFolderName] =
    useQueryState("folder_name");

  function handleSelectFolder() {
    setSelectedFolder(folder.id);
    setSelectedFolderName(folder.title);
  }

  const itemsLabel = `${folder.postsCount} ${folder.postsCount === 1 ? "item" : "items"}`;

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-input p-3 transition-colors hover:bg-card/70">
      <div
        onClick={handleSelectFolder}
        className="flex cursor-pointer items-start justify-between"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <FolderIcon className="size-4" />
        </div>

        <Star
          data-starred={folder.isStarred}
          className="size-4 shrink-0 text-muted-foreground data-[starred=true]:fill-foreground data-[starred=true]:text-foreground"
        />
      </div>

      <div onClick={handleSelectFolder} className="min-w-0 cursor-pointer">
        <p className="truncate text-sm font-semibold text-foreground">
          {folder.title}
        </p>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">{itemsLabel}</p>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <StarFolderButton
              folderId={folder.id}
              folderTitle={folder.title}
              folderPostsCount={folder.postsCount}
              folderIsStarred={folder.isStarred}
            />
            <DropdownMenuSeparator />
            <UpdateFolderNameDialog
              folderId={folder.id}
              folderName={folder.title}
            />
            <DropdownMenuSeparator />
            <DeleteFolderDialog
              folderId={folder.id}
              folderName={folder.title}
            />
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
