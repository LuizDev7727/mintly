import { Project } from "../types/project.js";

type GetProjectsParams = {
  channelId: string;
}

export type GetProjectsResponse = {
  projects: Array<Project>
}

export async function getProjects(
  { channelId }: GetProjectsParams
): Promise<GetProjectsResponse> {
  return {
    projects: [
      {
        id: "01a02f1a-21c5-72fe-88db-c515fef6a5e4",
        name: "How to create a MCP ?"
      }
    ]
  }
}
