import React, { createContext, useContext, useState, useEffect } from 'react';
import { Account, Company, Transaction, VatCode, JournalLine, GuidedTransactionParams } from './types';
import { SEED_ACCOUNTS, SEED_COMPANY, SEED_TRANSACTIONS, SEED_VAT_CODES } from './seed-data';

interface AppState {
  company: Company;
  accounts: Account[];
  transactions: Transaction[];
  vatCodes: VatCode[];
}

interface AppContextType extends AppState {
  addTransaction: (transaction: Transaction) => Promise<void>;
  updateAccount: (account: Account) => Promise<void>;
  getAccountBalance: (accountId: string) => number;
  resetData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'irish_ltd_books_data_v1';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState>(() => {
    // Try to load from local storage
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
    // Fallback to seed data
    return {
      company: SEED_COMPANY,
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      vatCodes: SEED_VAT_CODES,
    };
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const addTransaction = async (transaction: Transaction) => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));
    setState(prev => ({
      ...prev,
      transactions: [transaction, ...prev.transactions]
    }));
  };

  const updateAccount = async (account: Account) => {
    await new Promise(resolve => setTimeout(resolve, 300));
    setState(prev => ({
      ...prev,
      accounts: prev.accounts.map(a => a.id === account.id ? account : a)
    }));
  };

  const resetData = () => {
    setState({
      company: SEED_COMPANY,
      accounts: SEED_ACCOUNTS,
      transactions: SEED_TRANSACTIONS,
      vatCodes: SEED_VAT_CODES,
    });
  };

  // Helper to calculate running balance for an account
  const getAccountBalance = (accountId: string) => {
    const account = state.accounts.find(a => a.id === accountId);
    if (!account) return 0;

    let balance = 0;
    // Simple logic:
    // Asset/Expense: Dr increases, Cr decreases
    // Liability/Equity/Revenue: Cr increases, Dr decreases
    
    // BUT typically ledger balances are just Sum(Dr) - Sum(Cr) and interpretation depends on type.
    // Let's return the raw net value (Dr - Cr).
    // So positive means Debit balance, negative means Credit balance.
    
    state.transactions.forEach(t => {
      t.lines.forEach(line => {
        if (line.accountId === accountId) {
          balance += (line.debit - line.credit);
        }
      });
    });

    return balance;
  };

  return (
    <AppContext.Provider value={{ ...state, addTransaction, updateAccount, getAccountBalance, resetData }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppStore() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppStore must be used within an AppProvider');
  }
  return context;
}
