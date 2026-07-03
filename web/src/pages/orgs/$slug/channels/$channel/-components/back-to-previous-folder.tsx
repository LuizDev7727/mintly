import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useQueryState } from "nuqs";

type BackToPreviousFolderProps = {
  parent: {
    id: string;
    title: string;
  };
};

export function BackToPreviousFolder({ parent }: BackToPreviousFolderProps) {
  const [_, setFolder] = useQueryState("folder_id");

  function handleGoToPreviousFolder() {
    setFolder(parent.id);
  }

  return (
    <Button variant="outline" onClick={handleGoToPreviousFolder}>
      <ArrowLeft className="size-4" />
      Back to {parent.title}
    </Button>
  );
}
