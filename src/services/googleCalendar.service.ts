import { type calendar_v3, google } from 'googleapis';
import type {
	ListEventsRequest,
	ListEventsResponse,
} from '../dtos/googleCalendar.dto.js';
import { getGoogleAuth } from '../providers/google.provider.js';

function authService() {
	// Scopes required for the Calendar API
	const SCOPES: string[] = [
		'https://www.googleapis.com/auth/calendar.readonly',
	];

	return getGoogleAuth(SCOPES);
}

function getDefaultStartDate(): string {
	const date = new Date();
	date.setMonth(date.getMonth() - 3);
	return date.toISOString();
}

function getDefaultEndDate(): string {
	const date = new Date();
	date.setMonth(date.getMonth() + 3);
	return date.toISOString();
}

export async function listEvents(
	req: ListEventsRequest,
): Promise<ListEventsResponse> {
	const auth = authService();
	const calendar: calendar_v3.Calendar = google.calendar({
		version: 'v3',
		auth,
	});
	const res = await calendar.events.list({
		calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
		timeMin: req.startDate || getDefaultStartDate(),
		timeMax: req.endDate || getDefaultEndDate(),
		singleEvents: true,
		orderBy: 'startTime',
	});

	const events: calendar_v3.Schema$Event[] | undefined = res.data.items;
	if (!events) {
		return {
			events: [],
		} as ListEventsResponse;
	}

	return {
		events: events.map((event) => ({
			start: event.start?.dateTime || event.start?.date,
			end: event.end?.dateTime || event.end?.date,
			summary: event.summary,
		})),
	} as ListEventsResponse;
}
