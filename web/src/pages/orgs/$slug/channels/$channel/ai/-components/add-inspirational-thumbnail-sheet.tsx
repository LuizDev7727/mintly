import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ImageUp } from "lucide-react";
import { AddInspirationalThumbnailsForm } from "./add-inspirational-thumbnails-form";
import { Separator } from "@/components/ui/separator";

export function AddInspirationalThumbnailSheet() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button>
          <ImageUp className="size-4" />
          Add Inspirational Thumbnail
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add Inspirational Thumbnail</SheetTitle>
          <SheetDescription>
            All selected files will be converted to webp to a better quality.
          </SheetDescription>
        </SheetHeader>

        <Separator />

        <AddInspirationalThumbnailsForm />
      </SheetContent>
    </Sheet>
  );
}
