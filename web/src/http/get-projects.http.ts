import type { Project } from "@/types/project";
import { api } from "./api";

type GetProjectsParams = {
  orgSlug: string;
};

export type GetProjectsResponse = {
  projects: Project[];
};

export async function getProjectsHttp(
  params: GetProjectsParams,
): Promise<GetProjectsResponse> {
  const { orgSlug } = params;
  const { data } = await api.get<GetProjectsResponse>(
    `/organizations/${orgSlug}/projects`,
  );
  return data;
}
