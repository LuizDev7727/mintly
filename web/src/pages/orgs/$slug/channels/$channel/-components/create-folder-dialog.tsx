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

export function CreateFolderDialog() {
  const [currentFolder] = useQueryState("folder");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"outline"}>
          <FolderPlus className="mr-2 size-4" />
          New Folder
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Folder</DialogTitle>
          <DialogDescription>
            You are creating a folder in{" "}
            <span className="font-bold">{currentFolder ?? "Default"}</span>.
            This will permanently delete your account and remove your data from
            our servers.
          </DialogDescription>
        </DialogHeader>
        <CreateFolderForm />
      </DialogContent>
    </Dialog>
  );
}
