import { getFoldersHttp } from "@/http/folder/get-folders.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderCard } from "./folder-card";
import { parseAsInteger, useQueryState } from "nuqs";
import { BackToRootFolderButton } from "./back-to-root-folder-button";
import { FoldersPagination } from "./folders-pagination";
import { FolderListLoading } from "./folder-list-loading";
import { BackToPreviousFolder } from "./back-to-previous-folder";
import { FoldersListEmpty } from "./folders-list-empty";
import { CreateFolderDialog } from "./create-folder-dialog";

export function FoldersList() {
  const [currentFolderId] = useQueryState("folder_id");

  const [currentFolderPage] = useQueryState(
    "folder_page",
    parseAsInteger.withDefault(0),
  );

  const { slug: orgSlug, channel: channelId } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "folders",
      orgSlug,
      channelId,
      currentFolderId,
      currentFolderPage,
    ],
    queryFn: async () =>
      getFoldersHttp({
        orgSlug,
        channelId,
        folderId: currentFolderId,
        page: currentFolderPage,
      }),
    placeholderData: keepPreviousData,
  });

  if (isLoading || !data) {
    return <FolderListLoading />;
  }

  if (error) {
    return <p>Error to fetch folders: {error.message}</p>;
  }

  const { folders, parent, meta } = data;

  const hasParent = parent !== null;

  const { totalPages } = meta;

  const isEmpty = folders.length === 0;

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackToRootFolderButton />
          {hasParent && <BackToPreviousFolder parent={parent} />}
        </div>
        <div className="flex items-center gap-x-2">
          <CreateFolderDialog />
          <div className="bg-zinc-900 w-4 rotate-90 h-px" />
          <FoldersPagination
            isLoading={isLoading}
            totalPages={totalPages}
            currentFolderPage={currentFolderPage}
          />
        </div>
      </header>
      <div className="h-56">
        {isEmpty ? (
          <FoldersListEmpty />
        ) : (
          <div className="grid grid-cols-1 content-start gap-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {folders.map((folder) => (
              <FolderCard key={folder.id} folder={folder} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
