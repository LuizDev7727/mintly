import { presignUploadHttp } from "@/http/upload/presign-upload.http";
import { completeMultipartUploadHttp } from "@/http/upload/complete-multipart-upload.http";
import { listMultipartUploadPartsHttp } from "@/http/upload/list-multipart-upload-parts.http";
import {
  findResumableUpload,
  removeResumableUpload,
  saveResumableUpload,
} from "@/storage/resumable-upload-storage";
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

// evita que duas posts com o mesmo arquivo (mesma fingerprint) tentem
// retomar o mesmo uploadId concorrentemente na mesma sessão
const claimedFingerprints = new Set<string>();

function getFileFingerprint(file: File) {
  return { name: file.name, size: file.size, lastModified: file.lastModified };
}

export async function uploadFile({
  file,
  signal,
  onProgress,
}: UploadFileParams): Promise<UploadFileResponse> {
  const fingerprint = getFileFingerprint(file);
  const fingerprintKey = `${fingerprint.name}:${fingerprint.size}:${fingerprint.lastModified}`;

  const canResume = !claimedFingerprints.has(fingerprintKey);
  claimedFingerprints.add(fingerprintKey);

  try {
    let confirmedParts: { partNumber: number; eTag: string; size: number }[] = [];
    let resumeTarget: { key: string; uploadId: string } | null = null;

    if (canResume) {
      const match = findResumableUpload(fingerprint);

      if (match) {
        try {
          const result = await listMultipartUploadPartsHttp({
            key: match.key,
            uploadId: match.uploadId,
          });
          confirmedParts = result.parts;
          resumeTarget = { key: match.key, uploadId: match.uploadId };
        } catch {
          // uploadId inválido/expirado (já completado, abortado ou expurgado
          // pelo R2) — descarta o registro e segue com um upload novo
          removeResumableUpload(match.key);
        }
      }
    }

    let key: string;
    let uploadId: string | null;
    let parts: { partNumber: number; url: string }[];

    if (resumeTarget) {
      key = resumeTarget.key;
      uploadId = resumeTarget.uploadId;

      const totalParts = Math.ceil(file.size / PART_SIZE);
      const confirmedPartNumbers = new Set(
        confirmedParts.map((part) => part.partNumber),
      );
      const missingPartNumbers = Array.from(
        { length: totalParts },
        (_, index) => index + 1,
      ).filter((partNumber) => !confirmedPartNumbers.has(partNumber));

      parts = missingPartNumbers.length
        ? (
            await presignUploadHttp({
              file: { name: file.name, type: file.type, size: file.size },
              resume: { key, uploadId, partNumbers: missingPartNumbers },
            })
          ).parts
        : [];
    } else {
      const presigned = await presignUploadHttp({
        file: { name: file.name, type: file.type, size: file.size },
      });

      key = presigned.key;
      uploadId = presigned.uploadId;
      parts = presigned.parts;

      if (uploadId) {
        saveResumableUpload({
          key,
          uploadId,
          fileName: fingerprint.name,
          fileSize: fingerprint.size,
          fileLastModified: fingerprint.lastModified,
        });
      }
    }

    const loadedByPart: Record<number, number> = {};
    for (const part of confirmedParts) {
      loadedByPart[part.partNumber] = part.size;
    }

    function reportProgress() {
      const loaded = Object.values(loadedByPart).reduce(
        (total, value) => total + value,
        0,
      );
      onProgress(Math.round((loaded / file.size) * 100));
    }

    reportProgress();

    const uploadedParts: { partNumber: number; eTag: string }[] =
      confirmedParts.map(({ partNumber, eTag }) => ({ partNumber, eTag }));

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
          reportProgress();
        },
      });

      // o bucket precisa expor o header ETag via CORS (Access-Control-Expose-Headers)
      uploadedParts.push({ partNumber, eTag: response.headers.etag });
    }

    if (uploadId) {
      await completeMultipartUploadHttp({ key, uploadId, parts: uploadedParts });
      removeResumableUpload(key);
    }

    return { key };
  } finally {
    claimedFingerprints.delete(fingerprintKey);
  }
}
