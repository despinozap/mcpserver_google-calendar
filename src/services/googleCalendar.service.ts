import { type calendar_v3, google } from 'googleapis';
import { getGoogleAuth } from '../providers/google.provider.js';

function authService() {
	// Scopes required for the Calendar API
	const SCOPES: string[] = [
		'https://www.googleapis.com/auth/calendar.readonly',
	];

	return getGoogleAuth(SCOPES);
}

export async function listEvents(limit: number = 10): Promise<Array<any>> {
	const auth = authService();
	const calendar: calendar_v3.Calendar = google.calendar({
		version: 'v3',
		auth,
	});
	const res = await calendar.events.list({
		calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
		timeMax: new Date().toISOString(), // Look for events up to now.
		singleEvents: true,
		orderBy: 'startTime', // Sorts from oldest to newest.
	});

	const allPastEvents: calendar_v3.Schema$Event[] | undefined = res.data.items;
	if (!allPastEvents) {
		throw new Error('No past events found.');
	}

	// Get the last events and reverse them to show most recent first.
	const lastEvents: calendar_v3.Schema$Event[] = allPastEvents
		.slice(-limit)
		.reverse();

	return lastEvents.map((event) => ({
		start: event.start?.dateTime || event.start?.date,
		end: event.end?.dateTime || event.end?.date,
		summary: event.summary,
	}));
}
