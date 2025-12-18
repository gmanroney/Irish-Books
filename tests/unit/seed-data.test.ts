import { describe, it, expect } from 'vitest';
import { SEED_ACCOUNTS, SEED_COMPANY, SEED_TRANSACTIONS, SEED_VAT_CODES } from '@/lib/seed-data';

describe('Seed Data Integrity', () => {
  it('has a valid company definition', () => {
    expect(SEED_COMPANY).toHaveProperty('id');
    expect(SEED_COMPANY).toHaveProperty('name');
    expect(SEED_COMPANY.currency).toBe('EUR');
    expect(SEED_COMPANY.vatRegistered).toBe(true);
  });

  it('has valid accounts', () => {
    expect(SEED_ACCOUNTS.length).toBeGreaterThan(0);
    SEED_ACCOUNTS.forEach(account => {
      expect(account).toHaveProperty('id');
      expect(account).toHaveProperty('code');
      expect(account).toHaveProperty('name');
      expect(['Asset', 'Liability', 'Equity', 'Revenue', 'Expense']).toContain(account.type);
    });
  });

  it('has valid VAT codes', () => {
    expect(SEED_VAT_CODES.length).toBeGreaterThan(0);
    // Ensure Standard Rate 23% exists
    const stdRate = SEED_VAT_CODES.find(v => v.code === 'S23');
    expect(stdRate).toBeDefined();
    expect(stdRate?.rate).toBe(0.23);
  });

  it('has balanced transactions (Debits = Credits)', () => {
    expect(SEED_TRANSACTIONS.length).toBeGreaterThan(0);
    
    SEED_TRANSACTIONS.forEach(tx => {
      const totalDebit = tx.lines.reduce((sum, line) => sum + line.debit, 0);
      const totalCredit = tx.lines.reduce((sum, line) => sum + line.credit, 0);
      
      // Floating point check
      expect(totalDebit).toBeCloseTo(totalCredit, 2);
    });
  });

  it('transactions have valid account references', () => {
    const accountIds = new Set(SEED_ACCOUNTS.map(a => a.id));
    
    SEED_TRANSACTIONS.forEach(tx => {
      tx.lines.forEach(line => {
        expect(accountIds.has(line.accountId)).toBe(true);
      });
    });
  });
});
