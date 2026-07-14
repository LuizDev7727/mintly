import { presignUploadHttp } from "@/http/upload/presign-upload.http";
import { completeMultipartUploadHttp } from "@/http/upload/complete-multipart-upload.http";
import axios from "axios";

// precisa bater com PART_SIZE
export const PART_SIZE = 1024 * 1024 * 10; // 10 MB

type UploadFileParams = {
  file: File;
  signal: AbortSignal;
  onProgress: (progress: number) => void;
};

type UploadFileResponse = {
  key: string;
};

export async function uploadFile({
  file,
  signal,
  onProgress,
}: UploadFileParams): Promise<UploadFileResponse> {
  const { key, uploadId, parts } = await presignUploadHttp({
    file: { name: file.name, type: file.type, size: file.size },
  });

  const loadedByPart: Record<number, number> = {};
  const uploadedParts: { partNumber: number; eTag: string }[] = [];

  for (const { partNumber, url } of parts) {
    const chunk = uploadId
      ? file.slice(
          (partNumber - 1) * PART_SIZE,
          Math.min(partNumber * PART_SIZE, file.size),
        )
      : file;

    const response = await axios.put(url, chunk, {
      headers: { "Content-Type": file.type },
      signal,
      onUploadProgress: (event) => {
        loadedByPart[partNumber] = event.loaded;
        const loaded = Object.values(loadedByPart).reduce(
          (total, value) => total + value,
          0,
        );
        onProgress(Math.round((loaded / file.size) * 100));
      },
    });

    // o bucket precisa expor o header ETag via CORS (Access-Control-Expose-Headers)
    uploadedParts.push({ partNumber, eTag: response.headers.etag });
  }

  if (uploadId) {
    await completeMultipartUploadHttp({ key, uploadId, parts: uploadedParts });
  }

  return { key };
}
