import { getFoldersHttp } from "@/http/folder/get-folders.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderCard } from "./folder-card";
import { parseAsInteger, useQueryState } from "nuqs";
import { FoldersPagination } from "./folders-pagination";
import { FolderListLoading } from "./folder-list-loading";
import { BackToPreviousFolder } from "./back-to-previous-folder";
import { FoldersListEmpty } from "./folders-list-empty";
import { BackToRootFolderButton } from "./back-to-root-folder-button";

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackToRootFolderButton />
          {hasParent && <BackToPreviousFolder parent={parent} />}
        </div>
        {totalPages > 1 && (
          <FoldersPagination
            isLoading={isLoading}
            totalPages={totalPages}
            currentFolderPage={currentFolderPage}
          />
        )}
      </div>
      <div className="min-h-56">
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
