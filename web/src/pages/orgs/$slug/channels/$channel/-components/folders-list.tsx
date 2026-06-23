import { getFoldersHttp } from "@/http/folder/get-folders.http";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import { FolderCard } from "./folder-card";
import { useQueryState } from "nuqs";

export function FoldersList() {
  const [folderName] = useQueryState("folder", {
    defaultValue: "Default",
  });

  const { slug: orgSlug, channel: channelSlug } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const { data } = useSuspenseQuery({
    queryKey: ["folders", orgSlug, channelSlug, folderName],
    queryFn: async () => getFoldersHttp({ orgSlug, channelSlug, folderName }),
  });

  const { folders } = data;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
      {folders.map((folder) => (
        <FolderCard key={folder.id} folder={folder} />
      ))}
    </div>
  );
}
