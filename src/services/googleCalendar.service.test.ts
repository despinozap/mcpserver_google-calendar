import { google } from 'googleapis';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGoogleAuth } from '../providers/google.provider.js';
import { listEvents } from '../services/googleCalendar.service.js';

// Mock the dependencies
vi.mock('../providers/google.provider.js');
vi.mock('googleapis');

describe('Google Calendar Service', () => {
	const mockAuth = {};
	const mockCalendar = {
		events: {
			list: vi.fn(),
		},
	};

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getGoogleAuth).mockReturnValue(mockAuth as any);
		vi.mocked(google.calendar).mockReturnValue(mockCalendar as any);

		// Mock environment variable
		process.env.GOOGLE_CALENDAR_ID = 'test-calendar-id';
	});

	describe('listEvents', () => {
		it('should return formatted events when API call succeeds', async () => {
			const mockEvents = [
				{
					summary: 'Test Event 1',
					start: { dateTime: '2025-08-06T10:00:00Z' },
					end: { dateTime: '2025-08-06T11:00:00Z' },
				},
				{
					summary: 'Test Event 2',
					start: { date: '2025-08-07' },
					end: { date: '2025-08-07' },
				},
			];

			mockCalendar.events.list.mockResolvedValue({
				data: { items: mockEvents },
			});

			const result = await listEvents(2);

			expect(getGoogleAuth).toHaveBeenCalledWith([
				'https://www.googleapis.com/auth/calendar.readonly',
			]);
			expect(google.calendar).toHaveBeenCalledWith({
				version: 'v3',
				auth: mockAuth,
			});
			expect(mockCalendar.events.list).toHaveBeenCalledWith({
				calendarId: 'test-calendar-id',
				timeMax: expect.any(String),
				singleEvents: true,
				orderBy: 'startTime',
			});

			expect(result).toEqual([
				{
					summary: 'Test Event 2',
					start: '2025-08-07',
					end: '2025-08-07',
				},
				{
					summary: 'Test Event 1',
					start: '2025-08-06T10:00:00Z',
					end: '2025-08-06T11:00:00Z',
				},
			]);
		});

		it('should use default limit of 10 when not specified', async () => {
			const mockEvents = Array.from({ length: 15 }, (_, i) => ({
				summary: `Event ${i + 1}`,
				start: { dateTime: `2025-08-0${(i % 9) + 1}T10:00:00Z` },
				end: { dateTime: `2025-08-0${(i % 9) + 1}T11:00:00Z` },
			}));

			mockCalendar.events.list.mockResolvedValue({
				data: { items: mockEvents },
			});

			const result = await listEvents();

			expect(result).toHaveLength(10);
		});

		it('should handle mixed dateTime and date events', async () => {
			const mockEvents = [
				{
					summary: 'All Day Event',
					start: { date: '2025-08-06' },
					end: { date: '2025-08-06' },
				},
				{
					summary: 'Timed Event',
					start: { dateTime: '2025-08-06T14:00:00Z' },
					end: { dateTime: '2025-08-06T15:00:00Z' },
				},
			];

			mockCalendar.events.list.mockResolvedValue({
				data: { items: mockEvents },
			});

			const result = await listEvents(2);

			expect(result).toEqual([
				{
					summary: 'Timed Event',
					start: '2025-08-06T14:00:00Z',
					end: '2025-08-06T15:00:00Z',
				},
				{
					summary: 'All Day Event',
					start: '2025-08-06',
					end: '2025-08-06',
				},
			]);
		});

		it('should throw error when no events found', async () => {
			mockCalendar.events.list.mockResolvedValue({
				data: { items: undefined },
			});

			await expect(listEvents()).rejects.toThrow('No past events found.');
		});

		it('should use primary calendar when GOOGLE_CALENDAR_ID is not set', async () => {
			delete process.env.GOOGLE_CALENDAR_ID;

			mockCalendar.events.list.mockResolvedValue({
				data: { items: [] },
			});

			try {
				await listEvents();
			} catch {
				// Expect to throw because of empty items
			}

			expect(mockCalendar.events.list).toHaveBeenCalledWith({
				calendarId: 'primary',
				timeMax: expect.any(String),
				singleEvents: true,
				orderBy: 'startTime',
			});
		});

		it('should handle API errors gracefully', async () => {
			const apiError = new Error('API Error');
			mockCalendar.events.list.mockRejectedValue(apiError);

			await expect(listEvents()).rejects.toThrow('API Error');
		});
	});
});
