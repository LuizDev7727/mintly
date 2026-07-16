import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { createProjectHttp } from "@/http/projects/create-project.http";
import type { GetProjectsResponse } from "@/http/projects/get-projects.http";
import { authClient } from "@/lib/auth";
import {
  createProjectSchema,
  type CreateProjectFormType,
} from "@/schemas/project/create-project.schema";
import type { Project } from "@/types/project";
import { uploadFile } from "@/utils/upload-file";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { Loader2, Scissors, Video, X } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState, type ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatType(file: File): string {
  return (
    file.type.split("/")[1]?.toUpperCase() ??
    file.name.split(".").pop()?.toUpperCase() ??
    "VIDEO"
  );
}

export function CreateProjectForm() {
  const queryClient = useQueryClient();
  const { data: session } = authClient.useSession();

  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });
  const [titleFilter] = useQueryState(
    "title_filter",
    parseAsString.withDefault(""),
  );

  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormType>({
    resolver: zodResolver(createProjectSchema),
  });

  const file = watch("file");

  const { mutateAsync: createProject } = useMutation({
    mutationFn: createProjectHttp,
    onSuccess: (data, variables) => {
      const { projectId } = data;
      const { file } = variables;

      queryClient.setQueryData<GetProjectsResponse>(
        ["projects", slug, channel, titleFilter],
        (old) => {
          if (!old) {
            return old;
          }

          const newProject: Project = {
            id: projectId,
            title: file.name,
            thumbnailUrl: null,
            status: "PROCESSING",
            createdAt: new Date().toISOString(),
            clipCount: 0,
            owner: {
              name: session?.user.name ?? "",
              avatarUrl: session?.user.image ?? null,
            },
          };

          return {
            ...old,
            projects: [newProject, ...old.projects],
            meta: {
              ...old.meta,
              totalCount: old.meta.totalCount + 1,
            },
          };
        },
      );
    },
  });

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0];

    if (selected) {
      setValue("file", selected, { shouldValidate: true });
    }
  }

  function handleDeselect() {
    reset({ file: undefined });
  }

  async function handleCreateProject({ file }: CreateProjectFormType) {
    const abortController = new AbortController();

    try {
      const { key } = await uploadFile({
        file,
        signal: abortController.signal,
        onProgress: setUploadProgress,
      });

      await createProject({ channelId: channel, key, file });

      reset({ file: undefined });
    } catch (error) {
      if (!axios.isCancel(error)) {
        toast("Failed to upload video", {
          description: "Please try again.",
        });
      }
    } finally {
      setUploadProgress(0);
    }
  }

  return (
    <form
      onSubmit={handleSubmit(handleCreateProject)}
      className="flex flex-col gap-4 w-full"
    >
      {file ? (
        <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-input p-6 gap-3 text-center">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-full border bg-background">
            <Video className="size-4 opacity-60" />
          </div>
          <div className="space-y-0.5">
            <p className="text-sm font-medium line-clamp-2 leading-snug">
              {file.name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatType(file)} · {formatSize(file.size)}
            </p>
          </div>
          {isSubmitting ? (
            <div className="w-full max-w-xs space-y-1">
              <Progress value={uploadProgress} />
              <p className="text-xs text-muted-foreground">
                Uploading — {uploadProgress}%
              </p>
            </div>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDeselect}
            >
              <X className="size-3.5" />
              Remove video
            </Button>
          )}
        </div>
      ) : (
        <div
          className="cursor-pointer relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-input border-dashed p-6 transition-colors hover:bg-accent/50 has-disabled:pointer-events-none has-[input:focus]:border-ring has-disabled:opacity-50 has-[input:focus]:ring-[3px] has-[input:focus]:ring-ring/50 data-[dragging=true]:bg-accent/50"
          role="button"
          tabIndex={-1}
        >
          <input
            aria-label="Upload video"
            className="absolute inset-0 opacity-0 cursor-pointer"
            type="file"
            accept="video/*"
            onChange={handleChange}
          />
          <div className="flex flex-col items-center justify-center px-4 py-3 text-center">
            <div
              aria-hidden="true"
              className="mb-2 flex size-11 shrink-0 items-center justify-center rounded-full border bg-background"
            >
              <Video className="size-4 opacity-60" />
            </div>
            <p className="mb-1.5 font-medium text-sm">
              Drop your video here or click to browse
            </p>
          </div>
        </div>
      )}

      {errors.file && <FieldError>{errors.file.message}</FieldError>}

      <Button disabled={!file || isSubmitting}>
        {isSubmitting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Scissors className="size-4" />
        )}
        Generate Best Moments
      </Button>
    </form>
  );
}
