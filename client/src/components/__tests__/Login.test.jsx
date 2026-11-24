
/* @vitest-environment jsdom */

import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  render,
  screen,
  fireEvent,
  waitFor,
  cleanup,
} from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import Login from '../Login';

// Remove rendered components after every test
afterEach(() => {
  cleanup();
});

describe('Login component', () => {
  it('displays the login form correctly', () => {
    render(<Login onLogin={vi.fn()} />);

    expect(screen.getByText('Staff Login')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Sign In' })
    ).toBeInTheDocument();
  });

  it('submits login details and displays an error when login fails', async () => {
    const mockLogin = vi.fn().mockRejectedValue(
      new Error('Invalid credentials')
    );

    render(<Login onLogin={mockLogin} />);

    fireEvent.change(screen.getByLabelText('Email Address'), {
      target: { value: 'admin@example.com' },
    });

    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong-password' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Sign In' })
    );

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith(
        'admin@example.com',
        'wrong-password'
      );
    });

    expect(
      await screen.findByText('Invalid credentials')
    ).toBeInTheDocument();
  });
});
