import { sanitizeFilename } from "@/utils/sanitize-filename";
import { api } from "../api";

type CreateProjectHttpParams = {
  channelId: string;
  key: string;
  file: File;
};

type CreateProjectHttpResponse = {
  projectId: string;
};

export async function createProjectHttp(
  params: CreateProjectHttpParams,
): Promise<CreateProjectHttpResponse> {
  const { channelId, key, file } = params;

  const { data } = await api.post<CreateProjectHttpResponse>(
    `/channels/${channelId}/projects`,
    {
      file: {
        name: sanitizeFilename({ filename: file.name }),
        key,
      },
    },
  );

  return data;
}
