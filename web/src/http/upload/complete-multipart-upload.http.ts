import { api } from "../api";

type CompleteMultipartUploadHttpParams = {
  key: string;
  uploadId: string;
  parts: { partNumber: number; eTag: string }[];
};

export async function completeMultipartUploadHttp(
  params: CompleteMultipartUploadHttpParams,
): Promise<void> {
  const { key, uploadId, parts } = params;

  await api.post("/uploads/complete-multipart", { key, uploadId, parts });
}
