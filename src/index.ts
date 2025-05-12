import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from 'zod';

// Create server
const server = new McpServer({
  name: 'My MCP Server',
  version: '0.0.1',
});

// Define tools
server.tool(
  'echo_message',
  'Echo a given message',
  {
    message: z.string(),
  },
  async ({ message }) => {
    return {
      content: [
        {
          type: 'text',
          text: `The echo for the given message is ${message}`,
        },
      ]
    };
  },
);

// Listen client connections
const transport = new StdioServerTransport();
(async () => {
  try {
    await server.connect(transport);
  }
  catch (error) {
    console.error(error);
  }
})();