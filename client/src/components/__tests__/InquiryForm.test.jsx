
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

import InquiryForm from '../InquiryForm';
import { createInquiry } from '../../services/api';

vi.mock('../../services/api', () => ({
  createInquiry: vi.fn(),
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const mockProps = {
  token: 'test-token',
  onClose: vi.fn(),
  onCreated: vi.fn().mockResolvedValue(undefined),
};

function fillForm() {
  fireEvent.change(screen.getByLabelText('Customer Name'), {
    target: { value: '  John Silva  ' },
  });

  fireEvent.change(screen.getByLabelText('Contact Number / Method'), {
    target: { value: '  0771234567  ' },
  });

  fireEvent.change(screen.getByLabelText('Subject'), {
    target: { value: '  Coffee order  ' },
  });

  fireEvent.change(screen.getByLabelText('Description'), {
    target: { value: '  Customer asked about an order.  ' },
  });
}

describe('InquiryForm component', () => {
  it('displays all inquiry form fields', () => {
    render(<InquiryForm {...mockProps} />);

    expect(screen.getByLabelText('Customer Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Contact Number / Method')).toBeInTheDocument();
    expect(screen.getByLabelText('Subject')).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();

    expect(
      screen.getByRole('button', { name: 'Create Inquiry' })
    ).toBeInTheDocument();
  });

  it('rejects fields containing only whitespace', async () => {
    render(<InquiryForm {...mockProps} />);

    fireEvent.change(screen.getByLabelText('Customer Name'), {
      target: { value: '   ' },
    });

    fireEvent.change(screen.getByLabelText('Contact Number / Method'), {
      target: { value: '0771234567' },
    });

    fireEvent.change(screen.getByLabelText('Subject'), {
      target: { value: 'Test subject' },
    });

    fireEvent.change(screen.getByLabelText('Description'), {
      target: { value: 'Test description' },
    });

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Inquiry' })
    );

    expect(
      await screen.findByText(
        'Please fill in all fields with valid information.'
      )
    ).toBeInTheDocument();

    expect(createInquiry).not.toHaveBeenCalled();
  });

  it('trims input values before creating an inquiry', async () => {
    createInquiry.mockResolvedValue({});
    render(<InquiryForm {...mockProps} />);

    fillForm();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Inquiry' })
    );

    await waitFor(() => {
      expect(createInquiry).toHaveBeenCalledWith('test-token', {
        customer_name: 'John Silva',
        contact: '0771234567',
        subject: 'Coffee order',
        description: 'Customer asked about an order.',
      });
    });

    expect(mockProps.onCreated).toHaveBeenCalled();
  });

  it('displays an error when inquiry creation fails', async () => {
    createInquiry.mockRejectedValue(
      new Error('Unable to save inquiry')
    );

    render(<InquiryForm {...mockProps} />);

    fillForm();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Inquiry' })
    );

    expect(
      await screen.findByText('Unable to save inquiry')
    ).toBeInTheDocument();
  });

  it('disables the submit button while saving', async () => {
    let resolveRequest;

    createInquiry.mockReturnValue(
      new Promise((resolve) => {
        resolveRequest = resolve;
      })
    );

    render(<InquiryForm {...mockProps} />);

    fillForm();

    fireEvent.click(
      screen.getByRole('button', { name: 'Create Inquiry' })
    );

    expect(
      screen.getByRole('button', { name: 'Creating...' })
    ).toBeDisabled();

    resolveRequest({});

    await waitFor(() => {
      expect(mockProps.onCreated).toHaveBeenCalled();
    });
  });
});
