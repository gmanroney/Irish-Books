import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TransactionForm } from '@/components/transaction-form';
import { AppProvider } from '@/lib/store';
import { vi, describe, it, expect } from 'vitest';

// Mock scrollIntoView to avoid errors in jsdom
window.HTMLElement.prototype.scrollIntoView = function() {};

describe('TransactionForm', () => {
  it('submits the form when all mandatory fields are filled', async () => {
    const onSuccess = vi.fn();
    
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    // Fill Description
    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'Test Transaction' } });

    // Fill Amount
    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '150.00' } });

    // Click Save
    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    // Expect onSuccess to be called
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('shows validation error when amount is invalid', async () => {
    const onSuccess = vi.fn();
    
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    // Fill Description
    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'Test Transaction' } });

    // Amount is 0 by default or empty if we cleared it? 
    // The current implementation initializes it to 0.
    // Let's set it to 0 explicitly to trigger validation error if min is 0.01
    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '0' } });

    // Click Save
    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    // Expect validation error
    await waitFor(() => {
      expect(screen.getByText(/Amount must be greater than 0/i)).toBeInTheDocument();
    });

    expect(onSuccess).not.toHaveBeenCalled();
  });
});
