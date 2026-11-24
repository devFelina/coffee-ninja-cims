
import { describe, it, expect, vi, afterEach } from 'vitest';
import { loginStaff, getInquiries } from '../api';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('API services', () => {
  it('sends staff login details to the backend', async () => {
    const mockResponse = {
      token: 'test-token',
      user: { id: 1, name: 'Admin' },
    };

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await loginStaff('admin@example.com', 'password123');

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5005/api/auth/login',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123',
        }),
      }
    );

    expect(result).toEqual(mockResponse);
  });

  it('returns an error when login fails', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Invalid credentials' }),
    });

    await expect(
      loginStaff('admin@example.com', 'wrong-password')
    ).rejects.toThrow('Invalid credentials');
  });

  it('returns inquiries using the search and status filters', async () => {
    const mockInquiries = [
      { id: 1, customer_name: 'Kasun', status: 'New' },
    ];

    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      json: async () => mockInquiries,
    });

    const result = await getInquiries('test-token', {
      search: ' Kasun ',
      status: 'New',
    });

    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:5005/api/inquiries?search=Kasun&status=New',
      {
        headers: { Authorization: 'Bearer test-token' },
      }
    );

    expect(result).toEqual(mockInquiries);
  });
});
