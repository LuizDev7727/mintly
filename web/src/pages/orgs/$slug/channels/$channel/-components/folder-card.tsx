import { FolderIcon, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Folder } from "@/types/folder";
import { useQueryState } from "nuqs";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { UpdateFolderNameDialog } from "./update-folder-name-dialog";

type FolderCardProps = {
  folder: Folder;
};

export function FolderCard({ folder }: FolderCardProps) {
  const [_, setSelectedFolder] = useQueryState("folder", {
    defaultValue: "",
  });

  function handleSelectFolder() {
    setSelectedFolder(folder.title);
  }

  return (
    <div className="flex items-center justify-between rounded-lg border border-border p-3 transition-all hover:border-primary/40">
      <div
        onClick={handleSelectFolder}
        className="w-full group flex cursor-pointer items-center gap-x-3 "
      >
        <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
          <FolderIcon className="size-4" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="truncate text-sm font-semibold">{folder.title}</p>
          <p className="text-xs text-muted-foreground">
            {folder.postsCount} posts
          </p>
        </div>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <UpdateFolderNameDialog
            folderId={folder.id}
            folderName={folder.title}
          />
          <DropdownMenuSeparator />
          <DeleteFolderDialog folderId={folder.id} folderName={folder.title} />
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
