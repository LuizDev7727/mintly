import { sanitizeFilename } from "@/utils/sanitize-filename";
import { api } from "../api";

type AddInspirationalThumbnailHttpParams = {
  orgSlug: string;
  channelId: string;
  key: string;
  file: File;
};

type AddInspirationalThumbnailHttpResponse = {
  inspirationalThumbnailId: string;
};

export async function addInspirationalThumbnailHttp(
  params: AddInspirationalThumbnailHttpParams,
): Promise<AddInspirationalThumbnailHttpResponse> {
  const { orgSlug, channelId, key, file } = params;

  const { data } = await api.post<AddInspirationalThumbnailHttpResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/inspirational-thumbnails`,
    {
      name: sanitizeFilename({ filename: file.name }),
      type: file.type,
      size: file.size,
      key,
    },
  );

  return data;
}
