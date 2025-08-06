import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import type {
	ListEventsRequest,
	ListEventsResponse,
} from './dtos/googleCalendar.dto.js';
import { listEvents } from './services/googleCalendar.service.js';

// Create server
const server = new McpServer({
	name: 'Google Calendar',
	version: '0.0.1',
});

server.tool(
	'get_calendar_events',
	'Get calendar events from Google Calendar. By default, it retrieves events from the last 3 months.',
	{
		startDate: z
			.string()
			.optional()
			.describe('The start date for the event search. ISO 8601 format.'),
		endDate: z
			.string()
			.optional()
			.describe('The end date for the event search. ISO 8601 format.'),
	},
	async (params) => {
		const req: ListEventsRequest = {
			startDate: params.startDate,
			endDate: params.endDate,
		};

		const lastEvents: ListEventsResponse = await listEvents(req);
		return {
			content: [
				{
					type: 'text',
					text: `${JSON.stringify(lastEvents.events, null, 2)}`,
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
