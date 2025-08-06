import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import { listEvents } from './services/googleCalendar.service.js';

// Create server
const server = new McpServer({
	name: 'Google Calendar',
	version: '0.0.1',
});

server.tool(
	'get_last_calendar_events',
	'Get the last calendar events from Google Calendar',
	{
		limit: z
			.number()
			.min(1)
			.max(50)
			.default(10)
			.optional()
			.describe(
				'Number of events to retrieve, between 1 and 50. Default is 10.',
			),
	},
	async ({ limit }) => {
		const lastEvents = await listEvents(limit);
		return {
			content: [
				{
					type: 'text',
					text: `The last calendar events are: ${JSON.stringify(lastEvents)}`,
				},
			],
		};
	},
);

// Listen client connections
const transport = new StdioServerTransport();
(async () => {
	try {
		await server.connect(transport);
	} catch (error) {
		console.error(error);
	}
})();
