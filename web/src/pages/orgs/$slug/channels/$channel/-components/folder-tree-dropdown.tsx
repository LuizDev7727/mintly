import {
  FileTree,
  FileTreeFile,
  FileTreeFolder,
} from "@/components/file-tree";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  getFoldersTreeHttp,
  type FolderTreeNode,
} from "@/http/folder/get-folders-tree.http";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { ChevronDown, Folder, FolderOpen, PlusCircle } from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState, type ReactNode } from "react";
import { CreateFolderDialog } from "./create-folder-dialog";
import { FolderActionsMenu } from "./folder-actions-menu";

const ROOT_FOLDER_LABEL = "All Folders";

/** Dropdown em árvore para navegar entre as pastas do canal, a partir da raiz ("All Folders"). */
export function FolderTreeDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentFolderId, setCurrentFolderId] = useQueryState("folder_id");
  const [_, setCurrentFolderName] =
    useQueryState("folder_name");
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([]);

  const { slug: orgSlug, channel: channelId } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["folders", orgSlug, channelId],
    queryFn: () => getFoldersTreeHttp({ orgSlug, channelId }),
  });

  const folders = data?.folders ?? [];

  // Abre os ancestrais da pasta atual, para ela aparecer visível na árvore.
  useEffect(() => {
    if (!currentFolderId || folders.length === 0) return;

    const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
    const ancestorIds: string[] = [];
    let parentId = foldersById.get(currentFolderId)?.parentId ?? null;

    while (parentId !== null) {
      ancestorIds.push(parentId);
      parentId = foldersById.get(parentId)?.parentId ?? null;
    }

    if (ancestorIds.length === 0) return;

    setExpandedFolderIds((current) => [
      ...new Set([...current, ...ancestorIds]),
    ]);
  }, [currentFolderId, folders]);

  const foldersByParentId = new Map<string | null, FolderTreeNode[]>();

  for (const folder of folders) {
    const siblings = foldersByParentId.get(folder.parentId) ?? [];
    siblings.push(folder);
    foldersByParentId.set(folder.parentId, siblings);
  }

  const isRootFolder = currentFolderId === null;
  const isEmpty = !isLoading && folders.length === 0;

  function handleSelectRootFolder() {
    setCurrentFolderId(null);
    setCurrentFolderName(null);
    setIsOpen(false);
  }

  function handleSelectFolder(folderId: string) {
    const folder = folders.find((item) => item.id === folderId);

    if (!folder) return;

    setCurrentFolderId(folder.id);
    setCurrentFolderName(folder.title);
  }

  // Só pastas entram na árvore. Pasta sem subpastas vira "arquivo" para não mostrar
  // uma seta que não abre nada, mas continua com o ícone de pasta.
  function renderFolders(parentId: string | null): ReactNode {
    return (foldersByParentId.get(parentId) ?? []).map((folder) => {
      const actions = <FolderActionsMenu folder={folder} />;

      if (!folder.hasChildren) {
        return (
          <FileTreeFile
            key={folder.id}
            value={folder.id}
            name={folder.title}
            icon={<Folder className="size-4" />}
            actions={actions}
          />
        );
      }

      return (
        <FileTreeFolder
          key={folder.id}
          value={folder.id}
          name={folder.title}
          actions={actions}
        >
          {renderFolders(folder.id)}
        </FileTreeFolder>
      );
    });
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-fit justify-between gap-2">
          <span className="flex min-w-0 items-center gap-2">
            <Folder className="size-4 shrink-0" />
            <span className="truncate">
              All Folders
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 gap-0 p-1">
        <div className="max-h-80 overflow-y-auto pr-2 scrollbar-gutter-stable">
          <button
            type="button"
            data-active={isRootFolder}
            onClick={handleSelectRootFolder}
            className="flex h-9 w-full cursor-pointer items-center gap-2 rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:text-foreground data-[active=true]:bg-muted data-[active=true]:font-medium data-[active=true]:text-foreground"
          >
            <FolderOpen className="size-4" />
            {ROOT_FOLDER_LABEL}
          </button>

          {isLoading && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              Loading folders...
            </p>
          )}
          {isEmpty && (
            <p className="px-2 py-1.5 text-xs text-muted-foreground">
              No folders yet
            </p>
          )}

          {folders.length > 0 && (
            <FileTree
              ariaLabel="Folders"
              value={currentFolderId}
              onValueChange={handleSelectFolder}
              expandedIds={expandedFolderIds}
              onExpandedChange={setExpandedFolderIds}
            >
              {renderFolders(null)}
            </FileTree>
          )}
        </div>

        <Separator className="my-1" />
        <CreateFolderDialog
          trigger={
            <button
              type="button"
              className="flex w-full cursor-pointer items-center gap-2 p-2"
            >
              <div className="flex size-6 items-center justify-center rounded-md border bg-transparent">
                <PlusCircle className="size-4" />
              </div>
              <span className="font-medium text-muted-foreground">
                Create folder
              </span>
            </button>
          }
        />
      </PopoverContent>
    </Popover>
  );
}
