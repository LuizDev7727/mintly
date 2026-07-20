import { api } from "../api";

type ListMultipartUploadPartsHttpParams = {
  key: string;
  uploadId: string;
};

export type ListMultipartUploadPartsHttpResponse = {
  parts: { partNumber: number; eTag: string; size: number }[];
};

export async function listMultipartUploadPartsHttp(
  params: ListMultipartUploadPartsHttpParams,
): Promise<ListMultipartUploadPartsHttpResponse> {
  const { key, uploadId } = params;

  const { data } = await api.get<ListMultipartUploadPartsHttpResponse>(
    "/uploads/list-parts",
    { params: { key, uploadId } },
  );

  return data;
}
