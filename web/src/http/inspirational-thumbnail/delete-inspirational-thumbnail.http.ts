import { api } from "../api";

type DeleteInspirationalThumbnailHttpParams = {
  inspirationalThumbnailId: string;
};

export async function deleteInspirationalThumbnailHttp(
  params: DeleteInspirationalThumbnailHttpParams,
): Promise<void> {
  const { inspirationalThumbnailId } = params;

  await api.delete(`/inspirational-thumbnails/${inspirationalThumbnailId}`);
}
