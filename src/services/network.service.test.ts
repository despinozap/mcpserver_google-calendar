import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getPublicIP } from './network.service.js';

// Mock fetch globally
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('NetworkService', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('getPublicIP', () => {
		it('should return public IP when API call is successful', async () => {
			const mockIP = '192.168.1.1';
			const mockResponse = {
				ok: true,
				status: 200,
				json: vi.fn().mockResolvedValue({ ip: mockIP }),
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await getPublicIP();

			expect(result).toBe(mockIP);
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
			expect(mockResponse.json).toHaveBeenCalledOnce();
		});

		it('should throw error when API response is not ok', async () => {
			const mockResponse = {
				ok: false,
				status: 500,
				json: vi.fn(),
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(getPublicIP()).rejects.toThrow('HTTP error! status: 500');
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
			expect(mockResponse.json).not.toHaveBeenCalled();
		});

		it('should throw error when API response is 404', async () => {
			const mockResponse = {
				ok: false,
				status: 404,
				json: vi.fn(),
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(getPublicIP()).rejects.toThrow('HTTP error! status: 404');
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
		});

		it('should throw error when network request fails', async () => {
			const networkError = new Error('Network connection failed');
			mockFetch.mockRejectedValue(networkError);

			await expect(getPublicIP()).rejects.toThrow('Network connection failed');
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
		});

		it('should throw error when JSON parsing fails', async () => {
			const mockResponse = {
				ok: true,
				status: 200,
				json: vi.fn().mockRejectedValue(new Error('Invalid JSON')),
			};
			mockFetch.mockResolvedValue(mockResponse);

			await expect(getPublicIP()).rejects.toThrow('Invalid JSON');
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
			expect(mockResponse.json).toHaveBeenCalledOnce();
		});

		it('should handle timeout errors', async () => {
			const timeoutError = new Error('Request timeout');
			timeoutError.name = 'TimeoutError';
			mockFetch.mockRejectedValue(timeoutError);

			await expect(getPublicIP()).rejects.toThrow('Request timeout');
			expect(mockFetch).toHaveBeenCalledWith(
				'https://api.ipify.org?format=json',
			);
		});

		it('should return valid IP format', async () => {
			const mockIP = '203.0.113.195';
			const mockResponse = {
				ok: true,
				status: 200,
				json: vi.fn().mockResolvedValue({ ip: mockIP }),
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await getPublicIP();

			expect(result).toBe(mockIP);
			// Basic IP format validation (IPv4)
			expect(result).toMatch(/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/);
		});

		it('should handle IPv6 addresses', async () => {
			const mockIPv6 = '2001:0db8:85a3:0000:0000:8a2e:0370:7334';
			const mockResponse = {
				ok: true,
				status: 200,
				json: vi.fn().mockResolvedValue({ ip: mockIPv6 }),
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await getPublicIP();

			expect(result).toBe(mockIPv6);
		});

		it('should handle API response with additional fields', async () => {
			const mockIP = '198.51.100.1';
			const mockResponse = {
				ok: true,
				status: 200,
				json: vi.fn().mockResolvedValue({
					ip: mockIP,
					country: 'US',
					region: 'California',
				}),
			};
			mockFetch.mockResolvedValue(mockResponse);

			const result = await getPublicIP();

			expect(result).toBe(mockIP);
		});

		it('should log error when request fails', async () => {
			const consoleSpy = vi
				.spyOn(console, 'error')
				.mockImplementation(() => {});
			const networkError = new Error('Network failed');
			mockFetch.mockRejectedValue(networkError);

			await expect(getPublicIP()).rejects.toThrow('Network failed');

			expect(consoleSpy).toHaveBeenCalledWith(
				'Error fetching public IP:',
				networkError,
			);
			consoleSpy.mockRestore();
		});
	});
});
