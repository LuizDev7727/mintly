import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Pencil } from "lucide-react";
import { UpdateFolderNameForm } from "./update-folder-name-form";

type UpdateFolderNameDialogProps = {
  folderId: string;
  folderName: string;
};
export function UpdateFolderNameDialog({
  folderId,
  folderName,
}: UpdateFolderNameDialogProps) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"ghost"} className="w-full flex justify-start">
          <Pencil />
          Rename
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Rename Folder</DialogTitle>
          <DialogDescription>
            Enter a new name for this folder.
          </DialogDescription>
        </DialogHeader>

        <UpdateFolderNameForm folderId={folderId} folderName={folderName} />
      </DialogContent>
    </Dialog>
  );
}
