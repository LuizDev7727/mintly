import { api } from "../api";

type GetProjectParams = {
  projectId: string;
};

export type GetProjectResponse = {
  title: string;
  bestMomentsCount: number;
  owner: {
    name: string;
  };
};

export async function getProjectHttp(
  params: GetProjectParams,
): Promise<GetProjectResponse> {
  const { projectId } = params;
  const { data } = await api.get<GetProjectResponse>(
    `/projects/${projectId}`,
  );
  return data;
}
