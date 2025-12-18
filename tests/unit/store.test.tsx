import { renderHook, act, waitFor } from '@testing-library/react';
import { AppProvider, useAppStore } from '@/lib/store';
import { Transaction } from '@/lib/types';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import React from 'react';

// Mock wrapper for renderHook
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AppProvider>{children}</AppProvider>
);

describe('AppStore', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('initializes with seed data when localStorage is empty', () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    
    expect(result.current.company).toBeDefined();
    expect(result.current.accounts.length).toBeGreaterThan(0);
    expect(result.current.transactions.length).toBeGreaterThan(0);
    expect(result.current.vatCodes.length).toBeGreaterThan(0);
  });

  it('adds a transaction correctly', async () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    
    const initialCount = result.current.transactions.length;
    
    const newTransaction: Transaction = {
      id: 'test-tx-1',
      date: '2025-01-01',
      description: 'Test Transaction',
      source: 'Manual',
      createdAt: new Date().toISOString(),
      lines: [
        { id: 'l1', transactionId: 'test-tx-1', accountId: 'acc_1000', debit: 100, credit: 0 },
        { id: 'l2', transactionId: 'test-tx-1', accountId: 'acc_4000', debit: 0, credit: 100 }
      ]
    };

    await act(async () => {
      const promise = result.current.addTransaction(newTransaction);
      vi.advanceTimersByTime(500); // Advance past the delay
      await promise;
    });

    expect(result.current.transactions.length).toBe(initialCount + 1);
    expect(result.current.transactions[0]).toEqual(newTransaction);
  });

  it('updates an account correctly', async () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    
    const accountToUpdate = result.current.accounts[0];
    const updatedAccount = { ...accountToUpdate, name: 'Updated Name' };

    await act(async () => {
        const promise = result.current.updateAccount(updatedAccount);
        vi.advanceTimersByTime(300);
        await promise;
    });

    const account = result.current.accounts.find(a => a.id === accountToUpdate.id);
    expect(account?.name).toBe('Updated Name');
  });

  it('calculates account balance correctly', async () => {
    const { result } = renderHook(() => useAppStore(), { wrapper });
    
    // We'll create a new provider state by adding a transaction manually to a specific account
    // Actually, we can just rely on the addTransaction logic we verified above
    
    const testAccountId = 'acc_test_balance';
    // Add a fake account for isolation if we could, but we can't easily modify accounts list without updateAccount
    // Let's use an existing account ID that we know exists or just check the logic with a new transaction on a known account.
    
    const bankId = 'acc_1000'; // Bank Current Account (Asset)
    const initialBalance = result.current.getAccountBalance(bankId);
    
    // Add a transaction: Debit Bank 500
    const drTransaction: Transaction = {
      id: 'tx-bal-1',
      date: '2025-01-01',
      description: 'Debit Bank',
      source: 'Manual',
      createdAt: new Date().toISOString(),
      lines: [
        { id: 'l1', transactionId: 'tx-bal-1', accountId: bankId, debit: 500, credit: 0 },
        { id: 'l2', transactionId: 'tx-bal-1', accountId: 'acc_4000', debit: 0, credit: 500 }
      ]
    };

    await act(async () => {
        const promise = result.current.addTransaction(drTransaction);
        vi.advanceTimersByTime(500);
        await promise;
    });
    
    // Check balance immediately after transaction added
    expect(result.current.getAccountBalance(bankId)).toBe(initialBalance + 500);
  });
  
  it('calculates account balance correctly (async flow)', async () => {
      const { result } = renderHook(() => useAppStore(), { wrapper });
      const bankId = 'acc_1000';
      const initialBalance = result.current.getAccountBalance(bankId);

      const drTransaction: Transaction = {
          id: 'tx-bal-1',
          date: '2025-01-01',
          description: 'Debit Bank',
          source: 'Manual',
          createdAt: new Date().toISOString(),
          lines: [
            { id: 'l1', transactionId: 'tx-bal-1', accountId: bankId, debit: 500, credit: 0 },
            { id: 'l2', transactionId: 'tx-bal-1', accountId: 'acc_4000', debit: 0, credit: 500 }
          ]
        };
    
      await act(async () => {
          const promise = result.current.addTransaction(drTransaction);
          vi.advanceTimersByTime(500);
          await promise;
      });

      // Asset: Dr increases balance (if we treat Dr as positive net flow)
      // The getAccountBalance function returns (Debit - Credit)
      // So adding a Debit of 500 should increase the result by 500
      expect(result.current.getAccountBalance(bankId)).toBe(initialBalance + 500);
  });

  it('resets data to seed values', async () => {
      const { result } = renderHook(() => useAppStore(), { wrapper });
      
      // Change something
      const accountToUpdate = result.current.accounts[0];
      await act(async () => {
        const promise = result.current.updateAccount({ ...accountToUpdate, name: 'Changed' });
        vi.advanceTimersByTime(300);
        await promise;
      });
      
      expect(result.current.accounts[0].name).toBe('Changed');

      // Reset
      act(() => {
          result.current.resetData();
      });

      expect(result.current.accounts[0].name).toBe(accountToUpdate.name); // Should be back to original
  });
});
