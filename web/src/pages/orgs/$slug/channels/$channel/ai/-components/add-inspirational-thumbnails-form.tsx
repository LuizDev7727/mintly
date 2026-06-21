import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Spinner } from "@/components/ui/spinner";
import {
  inspirationalThumbnailsSchema,
  type InspirationalThumbnailsFormType,
} from "@/schemas/ai/inspirational-thumbnails.schema";
import { compressImage } from "@/utils/compress-image";
import { formatBytes } from "@/utils/format-bytes";
import { zodResolver } from "@hookform/resolvers/zod";
import { FileImage, Loader2, Trash, Upload } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export function AddInspirationalThumbnailsForm() {
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const {
    control,
    handleSubmit,
    setValue,
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
    if (!files) return;
    setIsConverting(true);

    for (let i = 0; i < files.length; i++) {
      append({ file: await compressImage({ file: files[i] }) });
    }

    setIsConverting(false);
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

  async function handleAddInspirationalThumbnails({
    inspirationalThumbnails,
  }: InspirationalThumbnailsFormType) {
    console.log({ inspirationalThumbnails });
  }

  function handleDeleteAllInspirationalThumbnailsSelected() {
    setValue("inspirationalThumbnails", []);
  }

  const totalThumbnailsSize = inspirationalThubmanils.reduce(
    (acc, thumbnail) => acc + thumbnail.file.size,
    0,
  );

  return (
    <form
      onSubmit={handleSubmit(handleAddInspirationalThumbnails)}
      className="flex flex-col flex-1 min-h-0 overflow-hidden"
    >
      <div className="flex flex-col flex-1 min-h-0 gap-3 p-4 overflow-hidden">
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
          data-converting={isConverting}
          className="shrink-0 flex flex-col items-center justify-center py-20 gap-4 text-center border border-input rounded-md border-dashed cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 dark:bg-zinc-900/20 hover:dark:bg-zinc-900/40 data-[dragging=true]:bg-primary/10 data-[dragging=true]:border-primary data-[dragging=true]:dark:bg-primary/10 data-[converting=true]:pointer-events-none data-[converting=true]:opacity-50"
        >
          {isConverting ? (
            <>
              <div className="size-16 rounded-full bg-secondary/50 border border-input flex items-center justify-center">
                <Loader2 className="size-8 text-muted-foreground animate-spin" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Converting images...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please wait while we process your files
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="size-16 rounded-full bg-secondary/50 border border-input flex items-center justify-center">
                <FileImage className="size-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  Drag & Drop your files
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  or click to browse — PNG, JPG, JPEG
                </p>
              </div>
            </>
          )}
        </label>

        <div className="shrink-0 flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <div className="font-medium">
              <h2>{inspirationalThubmanils.length} Files selected</h2>
            </div>
            <div className="size-1 rounded-full bg-zinc-700" />
            <p className="text-muted-foreground text-sm">
              {formatBytes(totalThumbnailsSize)}
            </p>
          </div>

          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleDeleteAllInspirationalThumbnailsSelected}
            disabled={isFilesSelectedEmpty || isSubmitting || isConverting}
          >
            <Trash className="size-4" />
            Delete All
          </Button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="space-y-2 pr-1">
            {inspirationalThubmanils.map(({ id, file }, index) => (
              <div
                key={id}
                className="flex items-center gap-3 rounded-lg border bg-muted/30 p-2"
              >
                <div className="shrink-0 rounded overflow-hidden bg-accent">
                  <img
                    alt={file.name}
                    className="size-10 object-cover"
                    src={URL.createObjectURL(file)}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm font-medium">{file.name}</p>
                  <div className="flex items-center gap-x-2">
                    <p className="text-muted-foreground text-xs">
                      {formatBytes(file.size)}
                    </p>
                    <div className="size-1 rounded-full bg-zinc-700" />
                    <button
                      type="button"
                      aria-label="Remove file"
                      className="shrink-0 cursor-pointer size-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeInspirationalThumbnail(index)}
                      disabled={isSubmitting}
                    >
                      <Trash className="size-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter className="flex-row gap-2 border-t p-4">
        <DialogClose asChild>
          <Button type="button" variant="secondary" className="flex-1">
            Cancel
          </Button>
        </DialogClose>
        <Button className="flex-1" disabled={isSubmitting || isConverting}>
          {isSubmitting ? <Spinner /> : <Upload className="size-4" />}
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}
