import { Badge } from "@/components/ui/badge";
import { FolderOpenDot } from "lucide-react";
import { useQueryState } from "nuqs";

export function CurrentFolderBadge() {
  const [currentFolder] = useQueryState("folder", {
    defaultValue: "Default",
  });

  return (
    <Badge>
      <FolderOpenDot /> {currentFolder ?? "Default"}
    </Badge>
  );
}
