import { api } from "../api";

type DeleteFolderParams = {
  folderId: string;
};

export async function deleteFolderHttp(params: DeleteFolderParams): Promise<void> {
  const { folderId } = params;
  await api.delete(`/folders/${folderId}`);
}
