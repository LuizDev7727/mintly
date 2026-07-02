import { Badge } from "@/components/ui/badge";
import { FolderOpenDot } from "lucide-react";
import { useQueryState } from "nuqs";

export function CurrentFolderBadge() {
  const [currentFolderName] = useQueryState("folder");

  return (
    <Badge>
      <FolderOpenDot /> {currentFolderName ?? "Root"}
    </Badge>
  );
}
