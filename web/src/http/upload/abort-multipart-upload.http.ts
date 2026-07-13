import { api } from "../api";

type AbortMultipartUploadHttpParams = {
  key: string;
  uploadId: string;
};

export async function abortMultipartUploadHttp(
  params: AbortMultipartUploadHttpParams,
): Promise<void> {
  const { key, uploadId } = params;

  await api.post("/uploads/abort-multipart", { key, uploadId });
}
