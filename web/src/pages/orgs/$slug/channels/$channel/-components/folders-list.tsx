import { getFoldersHttp } from "@/http/folder/get-folders.http";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderCard } from "./folder-card";
import { parseAsInteger, useQueryState } from "nuqs";
import { BackToRootFolderButton } from "./back-to-root-folder-button";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { FoldersPagination } from "./folders-pagination";
import { FolderListLoading } from "./folder-list-loading";

export function FoldersList() {
  const [folderName] = useQueryState("folder", {
    defaultValue: "Default",
  });

  const [folderPage] = useQueryState(
    "folder_page",
    parseAsInteger.withDefault(1),
  );

  const { slug: orgSlug, channel: channelSlug } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data, isLoading, error } = useQuery({
    queryKey: ["folders", orgSlug, channelSlug, folderName, folderPage],
    queryFn: async () =>
      getFoldersHttp({ orgSlug, channelSlug, folderName, page: folderPage }),
    placeholderData: keepPreviousData,
  });

  if (isLoading || !data) {
    return <FolderListLoading />;
  }

  if (error) {
    return <p>Error to fetch folders: {error.message}</p>;
  }

  const { folders, total } = data;

  return (
    <div className="space-y-2">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <BackToRootFolderButton />
          <Button variant={"outline"}>
            <ArrowLeft className="size-4" />
            Back to Folder name
          </Button>
        </div>
        <FoldersPagination isLoading={isLoading} totalFolders={total} />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {folders.map((folder) => (
          <FolderCard key={folder.id} folder={folder} />
        ))}
      </div>
    </div>
  );
}
