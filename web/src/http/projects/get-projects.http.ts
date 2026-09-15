import { api } from "../api";
import type { Project } from "@/types/project";

type GetProjectsParams = {
  orgSlug: string;
  channelId: string;
  pageIndex?: number;
  titleFilter: string | null;
  statusFilter: Project["status"] | null;
  ownerId: string | null;
};

export type GetProjectsResponse = {
  projects: Project[];
  meta: {
    totalCount: number;
    totalPages: number;
  };
};

export async function getProjectsHttp(
  params: GetProjectsParams,
): Promise<GetProjectsResponse> {
  const { orgSlug, channelId, pageIndex, titleFilter, statusFilter, ownerId } =
    params;
  const { data } = await api.get<GetProjectsResponse>(
    `/organizations/${orgSlug}/channels/${channelId}/projects`,
    { params: { pageIndex, titleFilter, statusFilter, ownerId } },
  );
  return data;
}
