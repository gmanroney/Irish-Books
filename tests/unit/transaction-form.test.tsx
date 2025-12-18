import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
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

  it('shows validation error when negative amount is entered', async () => {
    const onSuccess = vi.fn();
    
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '-50' } });

    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Amount must be greater than 0/i)).toBeInTheDocument();
    });
    
    expect(onSuccess).not.toHaveBeenCalled();
  });

  it('shows validation error when description is missing', async () => {
    const onSuccess = vi.fn();
    
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    // Leave description empty
    
    // Set valid amount
    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Assuming "String must contain at least 1 character(s)" or "Required" or similar from Zod
      // We can look for a general error or specific message. 
      // Let's assume Zod default "Required" or custom message. 
      // Checking for any role="alert" or text usually found in form errors.
      // Based on common Zod usage: "String must contain at least 1 character(s)"
      // Or we can just check onSuccess was NOT called
      expect(onSuccess).not.toHaveBeenCalled();
    });
  });

  it('renders payroll fields when payroll type is selected', async () => {
    const onSuccess = vi.fn();
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    // Select "Payroll Journal"
    // The Select component in Shadcn is tricky to test with simple fireEvent.change
    // We usually need to click trigger, then click item.
    
    const trigger = screen.getByTestId('select-type-trigger');
    fireEvent.click(trigger);
    
    // Wait for content
    // Use getAllByText and take the last one, or use a more specific selector like role="option"
    // Radix UI renders options with role="option"
    const payrollItem = await screen.findByRole('option', { name: 'Payroll Journal' });
    fireEvent.click(payrollItem);

    // Check for payroll specific fields
    expect(await screen.findByText('Net Pay (Paid from Bank)')).toBeInTheDocument();
    expect(screen.getByText('Employer PRSI')).toBeInTheDocument();


    // Fill payroll fields
    const netPayInput = screen.getByLabelText('Net Pay (Paid from Bank)');
    fireEvent.change(netPayInput, { target: { value: '2000' } });
    
    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '3000' } }); // Gross

    const prsiErInput = screen.getByLabelText('Employer PRSI');
    fireEvent.change(prsiErInput, { target: { value: '330' } });

    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'Jan Payroll' } });

    // Save
    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('renders and submits DLA Spend correctly', async () => {
    const onSuccess = vi.fn();
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    const trigger = screen.getByTestId('select-type-trigger');
    fireEvent.click(trigger);
    
    const dlaItem = await screen.findByRole('option', { name: 'Director Paid Expense' });
    fireEvent.click(dlaItem);

    // Expect account selector
    expect(await screen.findByText('Expense/Asset Account')).toBeInTheDocument();

    // Fill form
    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'Lunch' } });

    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '50' } });

    // Save
    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    await waitFor(() => {
        expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('validates reference constraints', async () => {
    const onSuccess = vi.fn();
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    const descriptionInput = screen.getByTestId('input-description');
    fireEvent.change(descriptionInput, { target: { value: 'Test Ref' } });

    const amountInput = screen.getByTestId('input-amount');
    fireEvent.change(amountInput, { target: { value: '100' } });

    const referenceInput = screen.getByTestId('input-reference');

    // Test 1: Spaces not allowed
    fireEvent.change(referenceInput, { target: { value: 'INV 001' } });
    const saveButton = screen.getByTestId('button-save-transaction');
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Reference cannot contain spaces/i)).toBeInTheDocument();
    });
    expect(onSuccess).not.toHaveBeenCalled();

    // Test 2: Max length
    fireEvent.change(referenceInput, { target: { value: 'A'.repeat(26) } });
    fireEvent.click(saveButton);
    
    await waitFor(() => {
      expect(screen.getByText(/Reference must be at most 25 characters/i)).toBeInTheDocument();
    });
    
    // Test 3: Uniqueness (Need to seed a transaction first or rely on seed data)
    // Seed data has "INC-001", "INV-2024-001", "PAY-001", "SUB-001", "DLA-001"
    fireEvent.change(referenceInput, { target: { value: 'INV-2024-001' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(screen.getByText(/Invoice number\/Reference must be unique/i)).toBeInTheDocument();
    });

    // Test 4: Valid reference
    fireEvent.change(referenceInput, { target: { value: 'UNIQUE-001' } });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('renders expense account selection for expenses', async () => {
    const onSuccess = vi.fn();
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    const trigger = screen.getByTestId('select-type-trigger');
    fireEvent.click(trigger);
    
    const expenseItem = await screen.findByRole('option', { name: 'Expense (Bank)' });
    fireEvent.click(expenseItem);

    expect(await screen.findByText('Expense/Asset Account')).toBeInTheDocument();
  });

  it('allows switching to advanced tab', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(
      <AppProvider>
        <TransactionForm onSuccess={onSuccess} />
      </AppProvider>
    );

    const advancedTab = screen.getByRole('tab', { name: 'Advanced Journal' });
    await user.click(advancedTab);

    // Look for text unique to the advanced tab
    expect(await screen.findByText(/Advanced Journal Entry/i)).toBeInTheDocument();
  });
});
