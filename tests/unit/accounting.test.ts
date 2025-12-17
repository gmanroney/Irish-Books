import { describe, it, expect } from 'vitest';
import { generateIrishPalletCoData, IRISH_PALLET_CO_ACCOUNTS } from '../helpers/seedIrishPalletCo';

describe('Irish Pallet Co - Accounting Logic', () => {
  const transactions = generateIrishPalletCoData();
  const accounts = IRISH_PALLET_CO_ACCOUNTS;

  const getBalance = (accountId: string) => {
    let balance = 0;
    transactions.forEach(t => {
      t.lines.forEach(line => {
        if (line.accountId === accountId) {
          balance += (line.debit - line.credit);
        }
      });
    });
    return balance;
  };

  it('Balance Sheet should balance (Assets = Liabilities + Equity + Net Profit)', () => {
    const assets = accounts.filter(a => a.type === 'Asset').reduce((sum, a) => sum + getBalance(a.id), 0);
    const liabilities = accounts.filter(a => a.type === 'Liability').reduce((sum, a) => sum + (-1 * getBalance(a.id)), 0);
    const equity = accounts.filter(a => a.type === 'Equity').reduce((sum, a) => sum + (-1 * getBalance(a.id)), 0);
    
    const revenue = accounts.filter(a => a.type === 'Revenue').reduce((sum, a) => sum + (-1 * getBalance(a.id)), 0);
    const expenses = accounts.filter(a => a.type === 'Expense').reduce((sum, a) => sum + getBalance(a.id), 0);
    const netProfit = revenue - expenses;

    // A = L + E + NP
    expect(assets).toBeCloseTo(liabilities + equity + netProfit, 2);
  });

  it('VAT Report assertions (T1, T2, T3)', () => {
    // T1: VAT on Sales (Output VAT)
    // We can look at the VAT Payable account credits for T1
    // And VAT Recoverable debits for T2
    // But the seed helper puts specific amounts.
    
    // Let's sum by VAT Code usage if possible, or just check the control accounts.
    // However, the prompt gives specific expected numbers.
    // Output VAT = €29,900
    // Input VAT = €16,100
    // Net Payable = €13,800

    // Output VAT is usually Credits in VAT Payable (Liability)
    const vatOutputBalance = -1 * getBalance("acc_vat_out");
    expect(vatOutputBalance).toBeCloseTo(29900, 2);

    // Input VAT is usually Debits in VAT Recoverable (Asset)
    const vatInputBalance = getBalance("acc_vat_in");
    expect(vatInputBalance).toBeCloseTo(16100, 2);

    const netPayable = vatOutputBalance - vatInputBalance;
    expect(netPayable).toBeCloseTo(13800, 2);
  });

  it('Profit & Loss assertions', () => {
    // Revenue
    const revWood = -1 * getBalance("acc_rev_wood");
    const revPlas = -1 * getBalance("acc_rev_plas");
    expect(revWood).toBe(80000);
    expect(revPlas).toBe(50000);
    
    // COGS
    const cogs = getBalance("acc_cogs_mat");
    expect(cogs).toBe(30000);

    // Expenses
    const wages = getBalance("acc_wages");
    const prsi = getBalance("acc_prsi_er");
    const util = getBalance("acc_util");
    const dep = getBalance("acc_dep_exp");

    expect(wages).toBe(480000);
    expect(prsi).toBe(55000);
    expect(util).toBe(20000);
    expect(dep).toBe(8000);

    // Net Profit calculation
    const totalRev = 130000;
    const totalExp = 30000 + 480000 + 55000 + 20000 + 8000; // 593,000
    const netProfit = totalRev - totalExp; // -463,000 (Loss)
    
    const calculatedNP = (revWood + revPlas) - (cogs + wages + prsi + util + dep);
    expect(calculatedNP).toBe(netProfit);
  });
});
