import { sanitizeFilename } from "@/utils/sanitize-filename";
import { api } from "../api";

type CreateProjectHttpParams = {
  orgSlug: string;
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
  const { orgSlug, channelId, key, file } = params;

  const { data } = await api.post<CreateProjectHttpResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/projects`,
    {
      file: {
        name: sanitizeFilename({ filename: file.name }),
        key,
      },
    },
  );

  return data;
}
