import { api } from "../api";

type PresignUploadHttpParams = {
  file: {
    name: string;
    type: string;
    size: number;
  };
  resume?: {
    key: string;
    uploadId: string;
    partNumbers: number[];
  };
};

export type PresignUploadHttpResponse = {
  key: string;
  uploadId: string | null;
  parts: { partNumber: number; url: string }[];
};

export async function presignUploadHttp(
  params: PresignUploadHttpParams,
): Promise<PresignUploadHttpResponse> {
  const { file, resume } = params;

  const { data } = await api.post<PresignUploadHttpResponse>(
    "/uploads/presign",
    { file, resume },
  );

  return data;
}
