import { Badge } from "@/components/ui/badge";
import { FolderOpenDot } from "lucide-react";
import { useQueryState } from "nuqs";

export function CurrentFolderBadge() {
  const [currentFolderName] = useQueryState("folder_name");

  return (
    <Badge
      key={currentFolderName}
      className="animate-in fade-in-0 zoom-in-95 duration-200"
    >
      <FolderOpenDot /> {currentFolderName ?? "Root"}
    </Badge>
  );
}
