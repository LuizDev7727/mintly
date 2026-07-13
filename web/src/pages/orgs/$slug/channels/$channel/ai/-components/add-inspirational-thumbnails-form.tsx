import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment"
import {
  inspirationalThumbnailsSchema,
  type InspirationalThumbnailsFormType,
} from "@/schemas/ai/inspirational-thumbnails.schema";
import { compressImage } from "@/utils/compress-image";
import { formatBytes } from "@/utils/format-bytes";
import { zodResolver } from "@hookform/resolvers/zod";
import { Ban, CheckIcon, CircleAlert, ClockIcon, FileImage, Loader2, Trash2, XIcon } from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";
import { addInspirationalThumbnailHttp } from "@/http/inspirational-thumbnail/add-inspirational-thumbnail.http";
import { uploadFile } from "@/utils/upload-file";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { useMutation, useQueryClient, type InfiniteData } from "@tanstack/react-query";
import type { GetInspirationalThumbnailsHttpResponse } from "@/http/inspirational-thumbnail/get-inspirational-thumbnails.http";

const LIMIT_FILE_SIZE = 1024 * 1024 * 10 // 10 MB

export type UploadStatus = "pending" | "uploading" | "cancelled" | "completed" | "error";

export type UploadEntry = {
  status: UploadStatus;
  progress: number;
  abortController: AbortController;
};

export function AddInspirationalThumbnailsForm() {

  const queryClient = useQueryClient();
  const [isDragging, setIsDragging] = useState(false);
  const [isConverting, setIsConverting] = useState(false);

  const [uploadProgressMap, setUploadProgressMap] = useState(
    new Map<number, UploadEntry>(),
  );

  const { channel } = useParams({
    from: "/orgs/$slug/channels/$channel"
  })

  const {
    control,
    handleSubmit,
    reset,
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
      if (files[i].size > LIMIT_FILE_SIZE) {
        toast("Please upload a file under 10MB.", {
          description: `File: ${files[i].name} is too large`
        })
      }
      else {
        append({ file: await compressImage({ file: files[i] }) });
      }
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

  const { mutateAsync: addInspirationalThumbnail } = useMutation({
    mutationFn: addInspirationalThumbnailHttp,
    onSuccess: (data, variables) => {

      const { inspirationalThumbnailId } = data;
      const { file, key } = variables;

      queryClient.setQueryData<InfiniteData<GetInspirationalThumbnailsHttpResponse>>(
        ["inspirational-thumbnails", channel],
        (old) => {
          if (!old) {
            return old;
          }

          const newInspirationalThumbnail = {
            id: inspirationalThumbnailId,
            name: file.name,
            key,
            sizeInMs: file.size,
            url: URL.createObjectURL(file),
          };

          return {
            ...old,
            pages: old.pages.map((page, index) =>
              index === 0
                ? {
                    ...page,
                    inspirationalThumbnails: [
                      newInspirationalThumbnail,
                      ...page.inspirationalThumbnails,
                    ],
                  }
                : page,
            ),
          };
        },
      );
    },
  })

  async function handleAddInspirationalThumbnails({
    inspirationalThumbnails,
  }: InspirationalThumbnailsFormType) {
    await Promise.all(
      inspirationalThumbnails.map( async ({ file }, index) => {
        const abortController = new AbortController();

        setUploadProgressMap((prev) => {
          const next = new Map(prev);
          next.set(index, { status: "uploading", progress: 0, abortController });
          return next;
        });

        try {
          const { key } = await uploadFile({
            file,
            signal: abortController.signal,
            onProgress: (progress) => {
              setUploadProgressMap((prev) => {
                const next = new Map(prev);
                next.set(index, { status: "uploading", progress, abortController });
                return next;
              });
            },
          });

          await addInspirationalThumbnail({
            channelId: channel,
            key,
            file,
          });

          setUploadProgressMap((prev) => {
            const next = new Map(prev);
            next.set(index, { status: "completed", progress: 100, abortController });
            return next;
          });
        } catch (error) {
          // usuário cancelou este upload — os outros arquivos do lote seguem normalmente
          if (axios.isCancel(error)) {
            setUploadProgressMap((prev) => {
              const next = new Map(prev);
              next.set(index, { status: "cancelled", progress: 0, abortController });
              return next;
            });
            return;
          }

          // erro de verdade (rede, R2, etc.) — não derruba os outros uploads do lote
          setUploadProgressMap((prev) => {
            const next = new Map(prev);
            next.set(index, { status: "error", progress: 0, abortController });
            return next;
          });
        }
      })
    )
    reset({ inspirationalThumbnails: [] })
    setUploadProgressMap(new Map())
  }

  function handleRemoveSelectedFile(index: number) {
    removeInspirationalThumbnail(index);
  }

  function handleCancelUpload(index: number) {
    uploadProgressMap.get(index)?.abortController.abort();
  }

  const inspirationalThumbnailsCount = inspirationalThubmanils.length;

  return (
    <form onSubmit={handleSubmit(handleAddInspirationalThumbnails)} className="flex flex-col md:flex-row gap-4 w-full">
      <div className="w-full">
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
          className="shrink-0 flex flex-col items-center justify-center h-62.5 md:h-full gap-4 text-center border border-input rounded-md border-dashed cursor-pointer transition-colors bg-secondary/20 hover:bg-secondary/40 dark:bg-zinc-900/20 hover:dark:bg-zinc-900/40 data-[dragging=true]:bg-primary/10 data-[dragging=true]:border-primary data-[dragging=true]:dark:bg-primary/10 data-[converting=true]:pointer-events-none data-[converting=true]:opacity-50"
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
      </div>
      <div className="w-full space-y-4">
        <div className="flex items-center justify-between">
          <h2>Files Selected</h2>
          <Button disabled={isSubmitting || isConverting || isFilesSelectedEmpty}>
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {inspirationalThumbnailsCount}
            {" "}
            Upload File(s)
          </Button>
        </div>
        <Separator />
        {
          isFilesSelectedEmpty ?
            (
              <div className="h-62.5 flex items-center justify-center">
                <p className="text-muted-foreground text-sm">No files selected</p>
              </div>
            ) : (
              <ScrollArea className="h-62.5">
                <div className="space-y-2">
                  {
                    inspirationalThubmanils.map(({ file }, index) => {

                      const entry = uploadProgressMap.get(index);
                      const status = entry?.status ?? "pending";
                      const progress = entry?.progress ?? 0;

                      const isUploading = status === "uploading";
                      const hasUploadCompleted = status === "completed";
                      const isCancelled = status === "cancelled";
                      const hasFailed = status === "error";

                      return (
                        <Attachment key={index} className="w-full">
                          <AttachmentMedia>
                            {
                              isUploading && <Spinner />
                            }
                            {
                              status === "pending" && <ClockIcon />
                            }
                            {
                              hasUploadCompleted && <CheckIcon />
                            }
                            {
                              isCancelled && <Ban />
                            }
                            {
                              hasFailed && <CircleAlert className="text-destructive" />
                            }
                          </AttachmentMedia>
                          <AttachmentContent>
                            <AttachmentTitle>{file.name}</AttachmentTitle>
                            {
                              isUploading &&
                                <AttachmentDescription>Uploading - {progress}%</AttachmentDescription>
                            }

                            {
                              status === "pending" && (
                                <AttachmentDescription>Ready to upload</AttachmentDescription>
                              )
                            }

                            {
                              hasUploadCompleted && <AttachmentDescription>Uploaded · {formatBytes(file.size)}</AttachmentDescription>
                            }

                            {
                              isCancelled && <AttachmentDescription>Upload cancelled</AttachmentDescription>
                            }

                            {
                              hasFailed && <AttachmentDescription className="text-destructive">Upload failed</AttachmentDescription>
                            }
                          </AttachmentContent>
                          <AttachmentActions>
                            <AttachmentAction
                              disabled={!isUploading}
                              type="button"
                              onClick={() => handleCancelUpload(index)}
                              aria-label={`Cancel upload of ${file.name}`}
                            >
                              <XIcon />
                            </AttachmentAction>
                            <AttachmentAction type="button" disabled={isUploading} onClick={() => handleRemoveSelectedFile(index)} aria-label={`Remove ${file.name}`}>
                              <Trash2 />
                            </AttachmentAction>
                          </AttachmentActions>
                        </Attachment>
                      )
                    })
                  }
                </div>
              </ScrollArea>
            )
        }
      </div>
    </form>
  );
}
