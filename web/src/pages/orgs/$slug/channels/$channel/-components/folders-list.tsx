import { getFoldersHttp } from "@/http/folder/get-folders.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderCard } from "./folder-card";
import { parseAsInteger, useQueryState } from "nuqs";
import { BackToRootFolderButton } from "./back-to-root-folder-button";
import { FoldersPagination } from "./folders-pagination";
import { FolderListLoading } from "./folder-list-loading";
import { BackToPreviousFolder } from "./back-to-previous-folder";

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

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackToRootFolderButton />
          {hasParent && <BackToPreviousFolder parent={parent} />}
        </div>
        <FoldersPagination
          isLoading={isLoading}
          totalPages={totalPages}
          currentFolderPage={currentFolderPage}
        />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
}
