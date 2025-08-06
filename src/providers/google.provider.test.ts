import { google } from 'googleapis';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getGoogleAuth } from '../providers/google.provider.js';

// Mock googleapis
vi.mock('googleapis', () => ({
	google: {
		auth: {
			GoogleAuth: vi.fn(),
		},
	},
}));

describe('Google Provider', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('getGoogleAuth', () => {
		it('should create GoogleAuth instance with correct parameters', () => {
			const mockGoogleAuth = vi.fn();
			vi.mocked(google.auth.GoogleAuth).mockImplementation(mockGoogleAuth);

			const scopes = ['https://www.googleapis.com/auth/calendar.readonly'];

			getGoogleAuth(scopes);

			expect(mockGoogleAuth).toHaveBeenCalledWith({
				keyFile: './credentials.json',
				scopes,
			});
		});

		it('should handle multiple scopes', () => {
			const mockGoogleAuth = vi.fn();
			vi.mocked(google.auth.GoogleAuth).mockImplementation(mockGoogleAuth);

			const scopes = [
				'https://www.googleapis.com/auth/calendar.readonly',
				'https://www.googleapis.com/auth/calendar.events',
			];

			getGoogleAuth(scopes);

			expect(mockGoogleAuth).toHaveBeenCalledWith({
				keyFile: './credentials.json',
				scopes,
			});
		});

		it('should handle empty scopes array', () => {
			const mockGoogleAuth = vi.fn();
			vi.mocked(google.auth.GoogleAuth).mockImplementation(mockGoogleAuth);

			const scopes: string[] = [];

			getGoogleAuth(scopes);

			expect(mockGoogleAuth).toHaveBeenCalledWith({
				keyFile: './credentials.json',
				scopes: [],
			});
		});
	});
});
