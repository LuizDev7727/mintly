import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FolderPlus } from "lucide-react";
import { CreateFolderForm } from "./create-folder-form";
import { useQueryState } from "nuqs";
import type { ReactNode } from "react";

type CreateFolderDialogProps = {
  /** Custom trigger element. Defaults to the "New Folder" button. */
  trigger?: ReactNode;
};

export function CreateFolderDialog({ trigger }: CreateFolderDialogProps) {
  const [currentFolderName] = useQueryState("folder_name");

  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button variant={"outline"}>
            <FolderPlus className="mr-2 size-4" />
            New Folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            You are creating a folder in{" "}
            <span className="font-bold">{currentFolderName ?? "Root"}</span>.
            This will permanently delete your account and remove your data from
            our servers.
          </DialogDescription>
        </DialogHeader>
        <CreateFolderForm />
      </DialogContent>
    </Dialog>
  );
}
