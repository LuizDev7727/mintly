import {
  type InfiniteData,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useParams } from "@tanstack/react-router";
import axios from "axios";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { addInspirationalThumbnailHttp } from "@/http/inspirational-thumbnail/add-inspirational-thumbnail.http";
import type { GetInspirationalThumbnailsHttpResponse } from "@/http/inspirational-thumbnail/get-inspirational-thumbnails.http";
import { compressImage } from "@/utils/compress-image";
import { uploadFile } from "@/utils/upload-file";

export const MAX_FILE_SIZE_IN_MB = 10;
export const ACCEPTED_IMAGE_TYPES = ".png,.jpg,.jpeg";

const MAX_FILE_SIZE = 1024 * 1024 * MAX_FILE_SIZE_IN_MB;
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg"];

export type ThumbnailUploadStatus = "processing" | "uploading" | "error";

export type ThumbnailUpload = {
  id: string;
  file: File;
  status: ThumbnailUploadStatus;
  progress: number;
};

// Upload começa assim que o arquivo é escolhido; o card some da lista de
// uploads quando termina (a thumbnail entra direto na biblioteca via cache).
export function useInspirationalThumbnailUploads() {
  const queryClient = useQueryClient();
  const { slug, channel } = useParams({
    from: "/orgs/$slug/channels/$channel",
  });

  const [uploads, setUploads] = useState<ThumbnailUpload[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const { mutateAsync: addInspirationalThumbnail } = useMutation({
    mutationFn: addInspirationalThumbnailHttp,
    onSuccess: ({ inspirationalThumbnailId }, { file }) => {
      queryClient.setQueryData<
        InfiniteData<GetInspirationalThumbnailsHttpResponse>
      >(["inspirational-thumbnails", channel], (old) => {
        if (!old) return old;

        const newInspirationalThumbnail = {
          id: inspirationalThumbnailId,
          name: file.name,
          sizeInBytes: file.size,
          url: URL.createObjectURL(file),
          createdAt: new Date(),
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
      });
    },
  });

  function patchUpload(id: string, patch: Partial<ThumbnailUpload>) {
    setUploads((prev) =>
      prev.map((upload) =>
        upload.id === id ? { ...upload, ...patch } : upload,
      ),
    );
  }

  function dismissUpload(id: string) {
    setUploads((prev) => prev.filter((upload) => upload.id !== id));
  }

  async function runUpload(id: string, file: File) {
    const controller = new AbortController();
    controllers.current.set(id, controller);
    patchUpload(id, { file, status: "uploading", progress: 0 });

    try {
      const { key } = await uploadFile({
        file,
        signal: controller.signal,
        onProgress: (progress) => patchUpload(id, { progress }),
      });

      await addInspirationalThumbnail({
        orgSlug: slug,
        channelId: channel,
        key,
        file,
      });

      dismissUpload(id);
    } catch (error) {
      // o usuário cancelou este upload — os outros do lote seguem normalmente
      if (axios.isCancel(error)) {
        dismissUpload(id);
        return;
      }

      patchUpload(id, { status: "error", progress: 0 });
    } finally {
      controllers.current.delete(id);
    }
  }

  async function processFile(original: File) {
    if (!ALLOWED_MIME_TYPES.includes(original.type)) {
      toast("Only PNG and JPG images are supported.", {
        description: `File: ${original.name}`,
      });
      return;
    }

    if (original.size > MAX_FILE_SIZE) {
      toast(`Please upload a file under ${MAX_FILE_SIZE_IN_MB}MB.`, {
        description: `File: ${original.name} is too large`,
      });
      return;
    }

    const id = crypto.randomUUID();
    setUploads((prev) => [
      ...prev,
      { id, file: original, status: "processing", progress: 0 },
    ]);

    try {
      await runUpload(id, await compressImage({ file: original }));
    } catch {
      patchUpload(id, { status: "error" });
    }
  }

  function addFiles(files: FileList | File[] | null) {
    if (!files) return;
    for (const file of Array.from(files)) {
      void processFile(file);
    }
  }

  function retryUpload(id: string) {
    const upload = uploads.find((item) => item.id === id);
    if (upload) void runUpload(id, upload.file);
  }

  function cancelUpload(id: string) {
    controllers.current.get(id)?.abort();
  }

  return { uploads, addFiles, retryUpload, cancelUpload, dismissUpload };
}
