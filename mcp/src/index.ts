import { serveStdio } from "@modelcontextprotocol/server/stdio";
import { mcp } from "./lib/mcp.js";
import "./tools/get-projects.tool.js";

function buildMcpServer() {
  return mcp;
}

serveStdio(buildMcpServer, {
  onerror: (error) => {
    console.error("Mintly MCP Server error: ", error)
  },
})

console.error("Mintly MCP Server running on stdio")
