import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { getPublicIP } from './services/network.service.js';

// Create server
const server = new McpServer({
	name: 'My MCP Server',
	version: '0.0.1',
});

// Define tools: Echo
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
			],
		};
	},
);

// Define tools: Get Public IP
server.tool('get_public_ip', 'Get the public IP address', {}, async () => {
	const ip = await getPublicIP();
	return {
		content: [
			{
				type: 'text',
				text: `Your public IP address is ${ip}`,
			},
		],
	};
});

// Listen client connections
const transport = new StdioServerTransport();
(async () => {
	try {
		await server.connect(transport);
	} catch (error) {
		console.error(error);
	}
})();
