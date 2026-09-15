import { sanitizeFilename } from "@/utils/sanitize-filename";
import { api } from "../api";

type CreateProjectHttpParams = {
  orgSlug: string;
  channelId: string;
  files: {
    key: string;
    file: File;
  }[];
};

export async function createProjectHttp(params: CreateProjectHttpParams) {
  const { orgSlug, channelId, files } = params;

  const { data } = await api.post(
    `/organizations/${orgSlug}/channels/${channelId}/projects`,
    {
      files: files.map(({ key, file }) => ({
        name: sanitizeFilename({ filename: file.name }),
        key,
      })),
    },
  );

  return data;
}
