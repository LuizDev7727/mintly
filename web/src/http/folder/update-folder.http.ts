import { api } from "../api";

type UpdateFolderParams = {
  folderId: string;
  title: string;
};

export async function updateFolderHttp(params: UpdateFolderParams): Promise<void> {
  const { folderId, title } = params;
  await api.put(`/folders/${folderId}`, { title });
}
