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
			const apiResponse = {
				data: {
					items: [
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
					],
				},
			};

			const expectedEvents = [
				{
					summary: 'Test Event 1',
					start: '2025-08-06T10:00:00Z',
					end: '2025-08-06T11:00:00Z',
				},
				{
					summary: 'Test Event 2',
					start: '2025-08-07',
					end: '2025-08-07',
				},
			];

			mockCalendar.events.list.mockResolvedValue(apiResponse);

			const result = await listEvents({
				startDate: '2025-08-01T00:00:00Z',
				endDate: '2025-08-31T23:59:59Z',
			});

			expect(getGoogleAuth).toHaveBeenCalledWith([
				'https://www.googleapis.com/auth/calendar.readonly',
			]);
			expect(google.calendar).toHaveBeenCalledWith({
				version: 'v3',
				auth: mockAuth,
			});
			expect(mockCalendar.events.list).toHaveBeenCalledWith({
				calendarId: 'test-calendar-id',
				timeMin: '2025-08-01T00:00:00Z',
				timeMax: '2025-08-31T23:59:59Z',
				singleEvents: true,
				orderBy: 'startTime',
			});

			expect(result).toEqual({ events: expectedEvents });
		});

		it('should use default dates when none are provided', async () => {
			mockCalendar.events.list.mockResolvedValue({ data: { items: [] } });

			await listEvents({});

			const expectedStartDate = new Date();
			expectedStartDate.setMonth(expectedStartDate.getMonth() - 3);

			const expectedEndDate = new Date();
			expectedEndDate.setMonth(expectedEndDate.getMonth() + 3);

			expect(mockCalendar.events.list).toHaveBeenCalledWith(
				expect.objectContaining({
					timeMin: expect.any(String),
					timeMax: expect.any(String),
				}),
			);

			const actualStartDate = new Date(
				mockCalendar.events.list.mock.calls[0][0].timeMin,
			);
			const actualEndDate = new Date(
				mockCalendar.events.list.mock.calls[0][0].timeMax,
			);

			// Allow for a small difference in execution time
			expect(actualStartDate.getTime()).toBeCloseTo(
				expectedStartDate.getTime(),
				-2,
			);
			expect(actualEndDate.getTime()).toBeCloseTo(
				expectedEndDate.getTime(),
				-2,
			);
		});

		it('should handle mixed dateTime and date events', async () => {
			const expectedEvents = [
				{
					summary: 'All Day Event',
					start: '2025-08-06',
					end: '2025-08-06',
				},
				{
					summary: 'Timed Event',
					start: '2025-08-06T14:00:00Z',
					end: '2025-08-06T15:00:00Z',
				},
			];

			const apiResponse = {
				data: {
					items: [
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
					],
				},
			};

			mockCalendar.events.list.mockResolvedValue(apiResponse);

			const result = await listEvents({});

			expect(result).toEqual({ events: expectedEvents });
		});

		it('should return empty array when no events are found', async () => {
			mockCalendar.events.list.mockResolvedValue({
				data: { items: undefined },
			});

			const result = await listEvents({});
			expect(result).toEqual({ events: [] });
		});

		it('should use primary calendar when GOOGLE_CALENDAR_ID is not set', async () => {
			delete process.env.GOOGLE_CALENDAR_ID;

			mockCalendar.events.list.mockResolvedValue({
				data: { items: [] },
			});

			await listEvents({});

			expect(mockCalendar.events.list).toHaveBeenCalledWith({
				calendarId: 'primary',
				timeMin: expect.any(String),
				timeMax: expect.any(String),
				singleEvents: true,
				orderBy: 'startTime',
			});
		});

		it('should handle API errors gracefully', async () => {
			const apiError = new Error('API Error');
			mockCalendar.events.list.mockRejectedValue(apiError);

			await expect(listEvents({})).rejects.toThrow('API Error');
		});
	});
});
