import { Folder, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function FolderCard() {
  return (
    <div className="group flex cursor-pointer items-center gap-x-3 rounded-lg border border-border p-3 transition-all hover:border-primary/40">
      <div className="shrink-0 rounded-md bg-primary/10 p-2 text-primary transition-colors group-hover:bg-primary/20">
        <Folder className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate text-sm font-semibold">Product Remap</p>
        <p className="text-xs text-muted-foreground">12 posts</p>
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer">
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Pencil />
            Rename
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive">
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
