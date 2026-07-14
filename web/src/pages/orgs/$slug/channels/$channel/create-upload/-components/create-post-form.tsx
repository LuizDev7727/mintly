import { TikTokIcon } from "@/components/tiktok-icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { YoutubeIcon } from "@/components/youtube-icon";
import { createPostsHttp } from "@/http/posts/create-posts.http";
import {
  createPostSchema,
  type CreatePostsFormType,
} from "@/schemas/posts/create-posts.schema";
import type { Integration } from "@/types/integration";
import { formatBytes } from "@/utils/format-bytes";
import { formatDuration } from "@/utils/format-duration";
import { getFileExtension } from "@/utils/get-file-extension";
import { sanitizeFilename } from "@/utils/sanitize-filename";
import { uploadFile } from "@/utils/upload-file";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import axios from "axios";
import {
  Calendar,
  CirclePlus,
  FileVideo,
  ListVideo,
  Scissors,
  Sparkles,
  Trash2,
  UploadCloudIcon,
  Video,
  X,
  XIcon,
} from "lucide-react";
import { useState, type ChangeEvent, type DragEvent } from "react";
import { useFieldArray, useForm } from "react-hook-form";

export type UploadStatus =
  | "pending"
  | "uploading"
  | "cancelled"
  | "completed"
  | "error";

export type UploadEntry = {
  status: UploadStatus;
  progress: number;
  abortController: AbortController;
};

type CreatePostFormProps = {
  integrations: Integration[];
};

function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Não foi possível carregar o vídeo'));
    };

    video.src = URL.createObjectURL(file);
  });
}


export function CreatePostForm({ integrations }: CreatePostFormProps) {
  const [isDragging, setIsDragging] = useState(false);

  const [uploadProgressMap, setUploadProgressMap] = useState(
    new Map<number, UploadEntry>(),
  );

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const navigate = useNavigate();

  const {
    control,
    register,
    watch,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
    setValue,
  } = useForm<CreatePostsFormType>({
    resolver: zodResolver(createPostSchema),
    defaultValues: { posts: [] },
  });

  const {
    fields: posts,
    append: addPost,
    remove: removePost,
  } = useFieldArray({ control, name: "posts" });

  const isPostsEmpty = posts.length === 0;
  const totalSize = posts.reduce(
    (acc, post) => acc + (post.file?.size ?? 0),
    0,
  );

  async function addFiles(files: FileList | null) {
    if (!files) {
      return;
    }

    for (const file of Array.from(files)) {

      const duration = file.type === "video/mp4" ? await getVideoDuration(file) : null;

      addPost({
        file,
        duration,
        scheduledTo: null,
        shouldGenerateThumbnail: false,
        shouldGenerateShorts: false,
        shouldGenerateVideoMetadata: false,
        socialsToPost: [],
      });
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

  function handleToggleIntegration(
    postIndex: number,
    integration: (typeof integrations)[0],
  ) {
    const current = getValues(`posts.${postIndex}.socialsToPost`);
    const isSelected = current.find((s) => s.id === integration.id);

    if (isSelected) {
      const restSelected = current.filter((s) => s.id !== integration.id);
      setValue(`posts.${postIndex}.socialsToPost`, restSelected);
    } else {
      setValue(`posts.${postIndex}.socialsToPost`, [integration, ...current]);
    }
  }

  const { mutateAsync: createPosts } = useMutation({
    mutationFn: createPostsHttp,
    onSuccess: () => {
      navigate({ to: "/orgs/$slug/channels/$channel", params: { slug, channel } });
    },
  });

  async function handleCreatePosts(formBody: CreatePostsFormType) {
    const uploadResults = await Promise.all(
      formBody.posts.map(async (post, index) => {
        const abortController = new AbortController();

        setUploadProgressMap((prev) => {
          const next = new Map(prev);
          next.set(index, { status: "uploading", progress: 0, abortController });
          return next;
        });

        try {
          const { key } = await uploadFile({
            file: post.file,
            signal: abortController.signal,
            onProgress: (progress) => {
              setUploadProgressMap((prev) => {
                const next = new Map(prev);
                const hasCompletedUpload = progress === 100;
                next.set(index, { status: hasCompletedUpload ? "completed" : "uploading", progress, abortController });
                return next;
              });
            },
          });

          return { post, key };
        } catch (error) {
          // usuário cancelou este upload — os outros arquivos do lote seguem normalmente
          if (axios.isCancel(error)) {
            setUploadProgressMap((prev) => {
              const next = new Map(prev);
              next.set(index, { status: "cancelled", progress: 0, abortController });
              return next;
            });
            return null;
          }

          // erro de verdade (rede, R2, etc.) — não derruba os outros uploads do lote
          setUploadProgressMap((prev) => {
            const next = new Map(prev);
            next.set(index, { status: "error", progress: 0, abortController });
            return next;
          });
          return null;
        }
      }),
    );

    const uploadedPosts = uploadResults.filter(
      (result): result is { post: CreatePostsFormType["posts"][number]; key: string } =>
        result !== null,
    );

    if (uploadedPosts.length === 0) {
      return;
    }

    await createPosts({
      channelId: channel,
      posts: uploadedPosts.map(({ post, key }) => ({
        file: {
          name: sanitizeFilename({ filename: post.file.name }),
          key,
          type: post.file.type,
          size: post.file.size,
          duration: post.duration,
        },
        shouldGenerateThumbnail: post.shouldGenerateThumbnail,
        shouldGenerateShorts: post.shouldGenerateShorts,
        scheduledTo: post.scheduledTo,
        socialsToPost: post.socialsToPost,
      })),
    });
  }

  function handleCancelUpload(postIndex: number) {
    uploadProgressMap.get(postIndex)?.abortController.abort();
  }

  return (
    <div className="space-y-4">
      <input
        id="file"
        name="file"
        type="file"
        multiple
        className="sr-only"
        onChange={handleSelectedVideos}
        accept=".mp4,video/mp4,.png,.jpg,.jpeg"
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
            Drag & Drop your files
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            or click to browse — MP4, PNG, JPG, JPEG
          </p>
        </div>
      </label>

      <Separator />

      <form onSubmit={handleSubmit(handleCreatePosts)} className="space-y-4">
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
                <span className="font-medium">{posts.length}</span> post(s)
              </span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="destructive"
              disabled={isSubmitting || isPostsEmpty}
              onClick={() => setValue("posts", [])}
            >
              <Trash2 className="size-4" />
              Delete All Posts
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              asChild
            >
              <label htmlFor="file">
                <CirclePlus className="size-4" />
                Add Post(s)
              </label>
            </Button>
            <Button type="submit" disabled={isSubmitting || isPostsEmpty}>
              <UploadCloudIcon className="size-4" />
              Upload All ({posts.length})
            </Button>
          </div>
        </header>

        {posts.map((post, postIndex) => {
          const shouldGenerateThumbnail = watch(
            `posts.${postIndex}.shouldGenerateThumbnail`,
          );
          const shouldGenerateShorts = watch(
            `posts.${postIndex}.shouldGenerateShorts`,
          );
          const socialsToPost = watch(`posts.${postIndex}.socialsToPost`);
          const isVideo = post.file.type === "video/mp4";

          const hasSelectedScheduledDate = !!watch(`posts.${postIndex}.scheduledTo`);

          const uploadEntry = uploadProgressMap.get(postIndex);
          const isUploading = uploadEntry?.status === "uploading";

          return (
            <div
              key={post.id}
              className="w-full overflow-hidden rounded-md border border-input"
            >
              <div className="flex flex-col gap-6 p-6">
                {/* File info + Actions */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-base font-semibold leading-tight text-foreground text-balance">
                      {post.file.name}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary" className="font-mono text-xs">
                        {formatBytes(post.file.size)}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {getFileExtension(post.file.name)}
                      </Badge>
                      {isVideo && <Badge
                      >
                        <FileVideo className="mr-1 size-3" />
                        {formatDuration(post.duration!)}
                      </Badge>}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-fit shrink-0"
                    disabled={isUploading}
                    onClick={() => removePost(postIndex)}
                  >
                    <Trash2 />
                    Remove Post
                  </Button>
                </div>

                {uploadEntry ? (
                  <div className="flex items-center gap-2">
                    <Progress value={uploadEntry.progress} className="flex-1" />
                    <span className="text-xs text-muted-foreground shrink-0">
                      {uploadEntry.status === "uploading" &&
                        `Uploading — ${uploadEntry.progress}%`}
                      {uploadEntry.status === "completed" && "Uploaded"}
                      {uploadEntry.status === "cancelled" && "Cancelled"}
                      {uploadEntry.status === "error" && "Upload failed"}
                    </span>
                    {isUploading && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleCancelUpload(postIndex)}
                        aria-label={`Cancel upload of ${post.file.name}`}
                      >
                        <XIcon className="size-4" />
                      </Button>
                    )}
                  </div>
                ) : (
                  <Separator />
                )}

                {/* AI Options */}
                <div className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-semibold text-foreground">
                      AI Options
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      You can enable both options
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <label
                      data-should-generate-thumbnail={shouldGenerateThumbnail}
                      className="flex cursor-pointer border-border data-[shouldGenerateThumbnail=true]:border-primary items-center gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Sparkles className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          Generate Thumbnail
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isVideo
                            ? "AI-powered thumbnail creation"
                            : "Not available for image files"}
                        </span>
                      </div>
                      <Switch
                        checked={shouldGenerateThumbnail}
                        disabled={!isVideo}
                        onCheckedChange={() =>
                          setValue(
                            `posts.${postIndex}.shouldGenerateThumbnail`,
                            !shouldGenerateThumbnail,
                          )
                        }
                      />
                    </label>

                    <label
                      data-should-generate-shorts={shouldGenerateShorts}
                      className="flex cursor-pointer items-center gap-4 rounded-lg border bg-background p-4 transition-colors hover:bg-accent/50"
                    >
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted">
                        <Scissors className="size-4 text-muted-foreground" />
                      </div>
                      <div className="flex flex-1 flex-col gap-0.5">
                        <span className="text-sm font-medium text-foreground">
                          Generate Shorts
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {isVideo
                            ? "Extract best moments with AI"
                            : "Not available for image files"}
                        </span>
                      </div>
                      <Switch
                        checked={shouldGenerateShorts}
                        disabled={!isVideo}
                        onCheckedChange={() =>
                          setValue(
                            `posts.${postIndex}.shouldGenerateShorts`,
                            !shouldGenerateShorts,
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <Separator />

                {/* Social + Playlist + Schedule */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-8">
                  <div className="flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-foreground">
                      Share to social media
                    </h4>
                    {integrations.map((integration) => {
                      const isSelected = socialsToPost.some(
                        (s) => s.id === integration.id,
                      );
                      return (
                        <button
                          key={integration.id}
                          type="button"
                          onClick={() =>
                            handleToggleIntegration(postIndex, integration)
                          }
                          data-selected={isSelected}
                          className="flex items-center border-border data-[selected=true]:border-primary cursor-pointer gap-2 rounded-md border bg-background px-3 py-2 text-sm transition-colors hover:bg-accent/50"
                        >
                          {integration.provider === "YOUTUBE" && (
                            <YoutubeIcon />
                          )}
                          {integration.provider === "TIKTOK" && <TikTokIcon />}
                          <span className="font-medium text-foreground">
                            {integration.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="flex flex-col gap-2 sm:ml-auto">
                    <h4 className="text-sm font-semibold text-foreground">
                      <Calendar className="mr-1.5 inline-block size-3.5 text-muted-foreground" />
                      Schedule for
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        type="datetime-local"
                        {...register(`posts.${postIndex}.scheduledTo`)}
                        className="h-9 flex-1 rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      />
                      {hasSelectedScheduledDate && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setValue(`posts.${postIndex}.scheduledTo`, null)
                          }
                        >
                          <X className="size-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </form>
    </div>
  );
}
