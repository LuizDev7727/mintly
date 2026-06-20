import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import {
  inspirationalThumbnailsSchema,
  type InspirationalThumbnailsFormType,
} from "@/schemas/ai/inspirational-thumbnails.schema";
import { compressImage } from "@/utils/compress-image";
import { formatBytes } from "@/utils/format-bytes";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileImage, Trash, Upload, X } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/avif"];
const MAX_SIZE_MB = 10;

export function AddInspirationalThumbnailsForm() {
  const [isDragging, setIsDragging] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<InspirationalThumbnailsFormType>({
    resolver: zodResolver(inspirationalThumbnailsSchema),
    defaultValues: {
      inspirationalThumbnails: [],
    },
  });

  const {
    fields: inspirationalThubmanils,
    append,
    remove: removeInspirationalThumbnail,
  } = useFieldArray({
    control,
    name: "inspirationalThumbnails",
  });

  const isFilesSelectedEmpty = inspirationalThubmanils.length === 0;

  async function addFiles(files: FileList | null) {
    if (files) {
      for (let i = 0; i < files.length; i++) {
        append({ file: await compressImage({ file: files[i] }) });
      }
    }
  }

  function handleSelectedFiles(event: ChangeEvent<HTMLInputElement>) {
    if (event.currentTarget.files) {
      addFiles(event.currentTarget.files);
    }
    event.currentTarget.value = "";
  }

  function handleDragOver(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    event.dataTransfer.dropEffect = "copy";
  }

  function handleDrop(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(false);
    addFiles(event.dataTransfer.files);
  }

  function handleDragEnter(event: DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(event: DragEvent<HTMLLabelElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }

  async function handleAddInspirationalThumbnails(
    event: InspirationalThumbnailsFormType,
  ) {}

  return (
    <form
      onSubmit={handleSubmit(handleAddInspirationalThumbnails)}
      className="flex flex-col gap-4"
    >
      <div className="p-4 space-y-2">
        <input
          id="file"
          name="file"
          type="file"
          multiple
          className="sr-only"
          onChange={handleSelectedFiles}
          accept=".png,.jpg,.jpeg"
        />

        <label
          htmlFor="file"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          data-dragging={isDragging}
          className="flex flex-col items-center justify-center py-20 gap-4 text-center border border-input rounded-md border-dashed cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 dark:bg-zinc-900/20 hover:dark:bg-zinc-900/40 data-[dragging=true]:bg-primary/10 data-[dragging=true]:border-primary data-[dragging=true]:dark:bg-primary/10"
        >
          <div className="size-16 rounded-full bg-secondary/50 border border-input flex items-center justify-center">
            <FileImage className="size-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              Drag & Drop your files
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              or click to browse — MP4, PNG, JPG, JPEG
            </p>
          </div>
        </label>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <h2 className="font-medium">
              {inspirationalThubmanils.length} Files Selected
            </h2>
            <p className="text-muted-foreground text-sm">(200 MB)</p>
          </div>

          <div className="flex items-center gap-x-2">
            <Button
              variant={"destructive"}
              disabled={isFilesSelectedEmpty || isSubmitting}
            >
              <Trash className="size-4" />
              Delete All
            </Button>
          </div>
        </div>

        <ScrollArea className="min-h-0 flex-1 px-4">
          {inspirationalThubmanils.map(({ id, file }, index) => {
            return (
              <div
                key={id}
                className="w-full flex items-start justify-between gap-2 rounded-lg border bg-background p-2 pe-3"
              >
                <div className="w-full flex items-start gap-3 overflow-hidden">
                  <div className="aspect-square shrink-0 rounded bg-accent">
                    <img
                      alt={file.name}
                      className="size-10 rounded-[inherit] object-cover"
                      src={URL.createObjectURL(file)}
                    />
                  </div>
                  <div className="w-full flex min-w-0 flex-col gap-0.5">
                    <div>
                      <p className="truncate font-medium text-[13px]">
                        {file.name}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {formatBytes(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <Progress value={10} />
                      <p className="text-muted-foreground text-xs">10%</p>
                    </div>
                  </div>
                </div>

                {isSubmitting ? (
                  <Button
                    aria-label="Remove file"
                    className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                    // onClick={() => removeFile("")}
                    size="icon"
                    variant="ghost"
                  >
                    <X aria-hidden="true" />
                  </Button>
                ) : (
                  <Button
                    aria-label="Remove file"
                    className="-me-2 size-8 text-muted-foreground/80 hover:bg-transparent hover:text-foreground"
                    onClick={() => removeInspirationalThumbnail(index)}
                    size="icon"
                    variant="ghost"
                  >
                    <Trash aria-hidden="true" />
                  </Button>
                )}
              </div>
            );
          })}
        </ScrollArea>
      </div>

      <SheetFooter className="flex-row gap-2 border-t">
        <SheetClose asChild>
          <Button variant={"secondary"} className="flex-1">
            Cancel
          </Button>
        </SheetClose>
        <Button className="flex-1">
          <Upload className="size-4" />
          Save
        </Button>
      </SheetFooter>
    </form>
  );
}
