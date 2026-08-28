import { api } from "../api";

type GetProjectParams = {
  orgSlug: string;
  channelId: string;
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
  const { orgSlug, channelId, projectId } = params;
  const { data } = await api.get<GetProjectResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/projects/${projectId}`,
  );
  return data;
}
