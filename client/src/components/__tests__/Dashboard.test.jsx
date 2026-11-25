/* @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import Dashboard from '../Dashboard';
import { getInquiries } from '../../services/api';

vi.mock('../../services/api', () => ({
  getInquiries: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockProps = {
  user: { name: 'Test Staff' },
  token: 'test-token',
  onLogout: vi.fn(),
};

describe('Dashboard component', () => {
  it('shows an empty state when no inquiries exist', async () => {
    getInquiries.mockResolvedValue([]);

    render(<Dashboard {...mockProps} />);

    expect(
      await screen.findByText('No inquiries found.')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('Loading inquiries...')
    ).not.toBeInTheDocument();
  });

  it('shows an error instead of an empty state when loading fails', async () => {
    getInquiries.mockRejectedValue(
      new Error('Unable to load inquiries')
    );

    render(<Dashboard {...mockProps} />);

    expect(
      await screen.findByText('Unable to load inquiries')
    ).toBeInTheDocument();

    expect(
      screen.queryByText('No inquiries found.')
    ).not.toBeInTheDocument();
  });
});
