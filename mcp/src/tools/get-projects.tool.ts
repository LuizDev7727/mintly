import { myFetch } from "../utils/my-fetch.js";
import { Project } from "../types/project.js";
import { z } from "zod";
import { mcp } from "../lib/mcp.js";
import { getProjectsContract } from "../contracts/get-projects-contract.js";

export type GetProjectsResponse = {
  projects: Array<Project>
}

function formatProject(project: Project): string {
  return [
    `Id: ${project.id}`,
    `Name: ${project.name}`,
    "----------------------------",
  ].join("\n");
}

export const getProjectsTool = mcp.registerTool(
  "get-projects-tool",
  {
    title: "Get Projects",
    description: "Get projects for a channel",
    inputSchema: z.object({
      channelId: z.uuidv7(),
    }),
    outputSchema: getProjectsContract,
  },
  async ({ channelId }) => {

    const { data, error } = await myFetch<GetProjectsResponse>({
      path: "/projects",
      channelId,
    })

    if (error) {
      return {
        content: [{ type: "text", text: `Failed to fetch projects: ${error.message}` }],
        structuredContent: [],
        isError: true,
      }
    }

    const { projects } = data

    const isProjectEmpty = projects.length === 0;

    const text =
      isProjectEmpty
        ? `No projects created for this channel`
        : `\n\n${projects.map(formatProject).join("\n")}`;

    return { content: [{ type: "text", text }], structuredContent: projects };
  },
);
