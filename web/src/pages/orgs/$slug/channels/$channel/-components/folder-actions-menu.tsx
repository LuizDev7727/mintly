import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { FolderTreeNode } from "@/http/folder/get-folders-tree.http";
import { MoreHorizontal } from "lucide-react";
import { DeleteFolderDialog } from "./delete-folder-dialog";
import { StarFolderButton } from "./star-folder-button";
import { UpdateFolderNameDialog } from "./update-folder-name-dialog";

type FolderActionsMenuProps = {
  folder: FolderTreeNode;
};

/** Menu "…" de uma pasta da árvore: favoritar, renomear e apagar. */
export function FolderActionsMenu({ folder }: FolderActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs">
          <MoreHorizontal className="size-4" />
          <span className="sr-only">Actions for {folder.title}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <StarFolderButton
          folderId={folder.id}
          folderTitle={folder.title}
          folderPostsCount={folder.postsCount}
          folderIsStarred={folder.isStarred}
        />
        <DropdownMenuSeparator />
        <UpdateFolderNameDialog folderId={folder.id} folderName={folder.title} />
        <DropdownMenuSeparator />
        <DeleteFolderDialog folderId={folder.id} folderName={folder.title} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
