import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { createProjectHttp } from "@/http/projects/create-project.http";
import {
  createProjectSchema,
  type CreateProjectFormType,
} from "@/schemas/project/create-project.schema";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { getFileExtension } from "@/utils/get-file-extension";
import { getVideoDuration } from "@/utils/get-video-duration";
import { uploadFile } from "@/utils/upload-file";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import {
  AlertTriangle,
  Check,
  CirclePlus,
  ListVideo,
  Loader2,
  Scissors,
  Trash2,
  Video,
} from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { toast } from "sonner";

type UploadStatus = "uploading" | "completed" | "error";

type UploadEntry = {
  status: UploadStatus;
  progress: number;
};

export function CreateProjectForm() {

  const navigate = useNavigate();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgressMap, setUploadProgressMap] = useState(
    new Map<number, UploadEntry>(),
  );

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const {
    control,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormType>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: { files: [] },
  });

  const {
    fields: videoFields,
    append: appendVideo,
    remove: removeVideo,
  } = useFieldArray({ control, name: "files" });

  const isFilesEmpty = videoFields.length === 0;
  const totalSize = videoFields.reduce(
    (acc, videoField) => acc + (videoField.file?.size ?? 0),
    0,
  );

  const { mutateAsync: createProject } = useMutation({
    mutationFn: createProjectHttp,
    onSuccess: () => {
      navigate({
        to: "/orgs/$slug/channels/$channel/projects",
        params: {
          slug,
          channel
        }
      })
    },
  });

  async function addFiles(fileList: FileList | null) {
    if (!fileList) return;

    for (const file of Array.from(fileList)) {
      const duration = await getVideoDuration(file).catch(() => null);
      appendVideo({ file, duration });
    }
  }

  function handleSelectedVideos(event: ChangeEvent<HTMLInputElement>) {
    addFiles(event.currentTarget.files);
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

  async function handleCreateProject({ files }: CreateProjectFormType) {
    const uploadResults = await Promise.all(
      files.map(async ({ file }, index) => {
        const abortController = new AbortController();

        setUploadProgressMap((prev) => {
          const next = new Map(prev);
          next.set(index, { status: "uploading", progress: 0 });
          return next;
        });

        try {
          const { key } = await uploadFile({
            file,
            signal: abortController.signal,
            onProgress: (progress) => {
              setUploadProgressMap((prev) => {
                const next = new Map(prev);
                const hasCompletedUpload = progress === 100;
                next.set(index, {
                  status: hasCompletedUpload ? "completed" : "uploading",
                  progress,
                });
                return next;
              });
            },
          });

          return { file, key };
        } catch (error) {
          setUploadProgressMap((prev) => {
            const next = new Map(prev);
            next.set(index, { status: "error", progress: 0 });
            return next;
          });

          if (!axios.isCancel(error)) {
            toast("Failed to upload video", {
              description: `${file.name} could not be uploaded.`,
            });
          }

          return null;
        }
      }),
    );

    const uploadedFiles = uploadResults.filter(
      (result): result is { file: File; key: string } => result !== null,
    );

    if (uploadedFiles.length === 0) {
      return;
    }

    await createProject({
      orgSlug: slug,
      channelId: channel,
      files: uploadedFiles,
    });

    reset({ files: [] });
    setUploadProgressMap(new Map());
  }

  return (
    <div className="flex flex-col gap-4 w-full">
      <input
        id="file"
        name="file"
        type="file"
        multiple
        className="sr-only"
        onChange={handleSelectedVideos}
        accept="video/*"
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
          <Video className="size-8 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Drag & Drop your videos
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse
          </p>
        </div>
      </label>

      {errors.files && <FieldError>{errors.files.message}</FieldError>}

      <Separator />

      <form
        onSubmit={handleSubmit(handleCreateProject)}
        className="flex flex-col gap-4"
      >
        <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <div className="px-2.5 py-1.5 dark:bg-zinc-900/20 border dark:text-primary border-input rounded-md">
              <p className="text-muted-foreground">
                Total:{" "}
                <span className="text-primary font-medium">
                  {formatBytes(totalSize)}
                </span>{" "}
                will be add to your storage
              </p>
            </div>
            <div className="px-2.5 py-1.5 dark:bg-zinc-900/20 border border-input rounded-md flex items-center gap-x-1.5 dark:text-primary">
              <ListVideo className="size-4 text-zinc-400" />
              <span className="text-zinc-400">
                <span className="font-medium">{videoFields.length}</span>{" "}
                video(s)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting || isFilesEmpty}
              onClick={() => setValue("files", [])}
            >
              <Trash2 className="size-4" />
              Remove All Videos
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              asChild
            >
              <label htmlFor="file">
                <CirclePlus className="size-4" />
                Add Video(s)
              </label>
            </Button>
            <Button type="submit" disabled={isSubmitting || isFilesEmpty}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Scissors className="size-4" />
              )}
              Generate Best Moments ({videoFields.length})
            </Button>
          </div>
        </header>

        {videoFields.map((videoField, index) => {
          const file = watch(`files.${index}.file`);
          const duration = watch(`files.${index}.duration`);
          const uploadEntry = uploadProgressMap.get(index);

          return (
            <div
              key={videoField.id}
              className="flex flex-col gap-2 rounded-lg border bg-card p-2 pe-3 transition-colors hover:bg-accent/30"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex aspect-video h-12 shrink-0 items-center justify-center overflow-hidden rounded bg-[#242424] text-[#888888]">
                    <Video size={16} strokeWidth={1.5} />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {formatBytes(file.size)} · {getFileExtension(file.name)}
                      {duration !== null && ` · ${formatDuration(duration)}`}
                    </p>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 text-muted-foreground hover:text-destructive"
                  disabled={isSubmitting}
                  onClick={() => removeVideo(index)}
                  aria-label={`Remove ${file.name}`}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>

              {uploadEntry && (
                <div className="flex items-center gap-2 ps-[60px]">
                  <Progress value={uploadEntry.progress} className="flex-1" />
                  <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                    {uploadEntry.status === "uploading" &&
                      `${uploadEntry.progress}%`}
                    {uploadEntry.status === "completed" && (
                      <>
                        <Check className="size-3.5 text-primary" />
                        Uploaded
                      </>
                    )}
                    {uploadEntry.status === "error" && (
                      <>
                        <AlertTriangle className="size-3.5 text-destructive" />
                        Upload failed
                      </>
                    )}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </form>
    </div>
  );
}
