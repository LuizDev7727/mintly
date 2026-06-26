import { Button } from "@/components/ui/button";
import { FolderRoot } from "lucide-react";
import { useQueryState } from "nuqs";

export function BackToRootFolderButton() {
  const [currentFolder, setFolder] = useQueryState("folder", {
    defaultValue: "Default",
  });

  function handleSetRootFolder() {
    setFolder("Default");
  }

  const isRootFolder = currentFolder === "Default";
  return (
    <Button
      variant={"outline"}
      onClick={handleSetRootFolder}
      disabled={isRootFolder}
    >
      <FolderRoot className="size-4" />
      Back to Root
    </Button>
  );
}
