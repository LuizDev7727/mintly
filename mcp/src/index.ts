import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { z } from "zod"
import { getProjectsContract } from "./contracts/get-projects-contract.js";
import { getProjects } from "./tools/get-projects.js";
import { Project } from "./types/project.js";

function formatProject(project: Project): string {
  return [
    `Id: ${project.id}`,
    `Name: ${project.name}`,
    "---",
  ].join("\n");
}

function buildMcpServer() {

  const server = new McpServer({
    name: "Mintly - MCP",
    version: "1.0.0"
  })

  server.registerTool(
    "get-projects",
    {
      title: "Get Projects",
      description: "Get projects for a channel",
      inputSchema: z.object({
        channelId: z.uuidv7(),
      }),
      outputSchema: getProjectsContract,
    },
    async ({ channelId }) => {

      const { projects } = await getProjects({
        channelId: channelId
      })

      const isProjectEmpty = projects.length === 0;

      const text =
        isProjectEmpty
          ? `No projects created for this channel`
          : `\n\n${projects.map(formatProject).join("\n")}`;

      return { content: [{ type: "text", text }], structuredContent: projects };
    },
  );

  return server;
}

serveStdio(buildMcpServer, {
  onerror: (error) => {
    console.error("Mintly MCP Server error: ", error)
  },
})

console.error("Mintly MCP Server running on stdio")
