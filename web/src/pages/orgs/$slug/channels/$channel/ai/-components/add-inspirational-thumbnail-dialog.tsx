import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ImageUp } from "lucide-react";
import { AddInspirationalThumbnailsForm } from "./add-inspirational-thumbnails-form";

export function AddInspirationalThumbnailDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>
          <ImageUp className="size-4" />
          Add Inspirational Thumbnail
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl flex flex-col max-h-[90vh] overflow-hidden p-0 gap-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle>Add Inspirational Thumbnail</DialogTitle>
          <DialogDescription>
            All selected files will be converted to WebP for better quality.
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <AddInspirationalThumbnailsForm />
      </DialogContent>
    </Dialog>
  );
}
