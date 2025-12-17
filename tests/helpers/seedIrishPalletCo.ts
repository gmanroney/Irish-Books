import { Transaction, Account } from "@/lib/types";
import { addDays, format } from "date-fns";

// Helper to create IDs
const uuid = () => Math.random().toString(36).substring(2, 15);

export const IRISH_PALLET_CO_ACCOUNTS: Account[] = [
  // Assets
  { id: "acc_bank", code: "1000", name: "Bank Current Account", type: "Asset", isControl: false },
  { id: "acc_inv_raw", code: "1500", name: "Inventory - Raw Materials", type: "Asset", isControl: false },
  { id: "acc_inv_fin", code: "1510", name: "Inventory - Finished Goods", type: "Asset", isControl: false },
  { id: "acc_fa_plant", code: "1600", name: "Fixed Assets - Plant & Machinery", type: "Asset", isControl: false },
  { id: "acc_acc_dep", code: "1690", name: "Accumulated Depreciation", type: "Asset", isControl: true },
  { id: "acc_ar", code: "1100", name: "Accounts Receivable", type: "Asset", isControl: true },
  { id: "acc_vat_in", code: "1300", name: "VAT Recoverable (Input)", type: "Asset", isControl: true },

  // Liabilities
  { id: "acc_ap", code: "2000", name: "Accounts Payable", type: "Liability", isControl: true },
  { id: "acc_vat_out", code: "2100", name: "VAT Payable (Output)", type: "Liability", isControl: true },
  { id: "acc_pay_liab", code: "2200", name: "Payroll Liabilities", type: "Liability", isControl: true },

  // Equity
  { id: "acc_share_cap", code: "3000", name: "Share Capital", type: "Equity", isControl: false },
  { id: "acc_ret_earn", code: "3100", name: "Retained Earnings", type: "Equity", isControl: false },

  // Revenue
  { id: "acc_rev_wood", code: "4000", name: "Sales - Wood Pallets", type: "Revenue", isControl: false },
  { id: "acc_rev_plas", code: "4010", name: "Sales - Plastic Pallets", type: "Revenue", isControl: false },

  // Expenses / COGS
  { id: "acc_cogs_mat", code: "5000", name: "COGS - Materials", type: "Expense", isControl: false },
  { id: "acc_wages", code: "6000", name: "Wages & Salaries", type: "Expense", isControl: false },
  { id: "acc_prsi_er", code: "6010", name: "Employer PRSI", type: "Expense", isControl: false },
  { id: "acc_util", code: "6200", name: "Utilities/Energy", type: "Expense", isControl: false },
  { id: "acc_dep_exp", code: "6800", name: "Depreciation Expense", type: "Expense", isControl: false },
];

export const generateIrishPalletCoData = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const date = (d: string) => d; // Keep simple string dates for tests

  // A) Opening Balances (1 Jan 2026)
  transactions.push({
    id: "t_open",
    date: "2026-01-01",
    description: "Opening Balances",
    source: "Manual",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_open", accountId: "acc_bank", debit: 200000, credit: 0 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_inv_raw", debit: 60000, credit: 0 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_inv_fin", debit: 40000, credit: 0 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_fa_plant", debit: 500000, credit: 0 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_acc_dep", debit: 0, credit: 150000 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_share_cap", debit: 0, credit: 100000 },
      { id: uuid(), transactionId: "t_open", accountId: "acc_ret_earn", debit: 0, credit: 550000 }, // Balancing figure
    ]
  });

  // B) Buy raw materials (Input VAT)
  // Net 50k, VAT 11.5k, Gross 61.5k
  transactions.push({
    id: "t_buy_mat",
    date: "2026-01-05",
    description: "Purchase Raw Materials",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_buy_mat", accountId: "acc_inv_raw", debit: 50000, credit: 0, vatCodeId: "vat_23", vatAmount: 11500 },
      { id: uuid(), transactionId: "t_buy_mat", accountId: "acc_vat_in", debit: 11500, credit: 0 },
      { id: uuid(), transactionId: "t_buy_mat", accountId: "acc_ap", debit: 0, credit: 61500 },
    ]
  });

  // Pay Supplier
  transactions.push({
    id: "t_pay_sup",
    date: "2026-01-06",
    description: "Pay Supplier",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_pay_sup", accountId: "acc_ap", debit: 61500, credit: 0 },
      { id: uuid(), transactionId: "t_pay_sup", accountId: "acc_bank", debit: 0, credit: 61500 },
    ]
  });

  // C) Issue materials to production
  transactions.push({
    id: "t_issue_mat",
    date: "2026-01-10",
    description: "Issue Materials to Production",
    source: "Manual",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_issue_mat", accountId: "acc_cogs_mat", debit: 30000, credit: 0 },
      { id: uuid(), transactionId: "t_issue_mat", accountId: "acc_inv_raw", debit: 0, credit: 30000 },
    ]
  });

  // D) Sales Invoices
  // Cust A: Net 80k, VAT 18.4k, Gross 98.4k
  transactions.push({
    id: "t_sale_a",
    date: "2026-01-15",
    description: "Sale Wood Pallets",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_sale_a", accountId: "acc_ar", debit: 98400, credit: 0 },
      { id: uuid(), transactionId: "t_sale_a", accountId: "acc_rev_wood", debit: 0, credit: 80000, vatCodeId: "vat_23", vatAmount: 18400 },
      { id: uuid(), transactionId: "t_sale_a", accountId: "acc_vat_out", debit: 0, credit: 18400 },
    ]
  });

  // Cust B: Net 50k, VAT 11.5k, Gross 61.5k
  transactions.push({
    id: "t_sale_b",
    date: "2026-01-16",
    description: "Sale Plastic Pallets",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_sale_b", accountId: "acc_ar", debit: 61500, credit: 0 },
      { id: uuid(), transactionId: "t_sale_b", accountId: "acc_rev_plas", debit: 0, credit: 50000, vatCodeId: "vat_23", vatAmount: 11500 },
      { id: uuid(), transactionId: "t_sale_b", accountId: "acc_vat_out", debit: 0, credit: 11500 },
    ]
  });

  // Receive Payments
  transactions.push({
    id: "t_rec_a",
    date: "2026-01-20",
    description: "Payment Cust A",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_rec_a", accountId: "acc_bank", debit: 98400, credit: 0 },
      { id: uuid(), transactionId: "t_rec_a", accountId: "acc_ar", debit: 0, credit: 98400 },
    ]
  });
  transactions.push({
    id: "t_rec_b",
    date: "2026-01-20",
    description: "Payment Cust B",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_rec_b", accountId: "acc_bank", debit: 61500, credit: 0 },
      { id: uuid(), transactionId: "t_rec_b", accountId: "acc_ar", debit: 0, credit: 61500 },
    ]
  });

  // E) Payroll
  transactions.push({
    id: "t_payroll",
    date: "2026-01-25",
    description: "Jan Payroll",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_payroll", accountId: "acc_wages", debit: 480000, credit: 0 },
      { id: uuid(), transactionId: "t_payroll", accountId: "acc_prsi_er", debit: 55000, credit: 0 },
      { id: uuid(), transactionId: "t_payroll", accountId: "acc_bank", debit: 0, credit: 330000 },
      { id: uuid(), transactionId: "t_payroll", accountId: "acc_pay_liab", debit: 0, credit: 205000 },
    ]
  });
  
  // Pay Payroll Liab
  transactions.push({
    id: "t_pay_tax",
    date: "2026-01-28",
    description: "Pay Payroll Taxes",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_pay_tax", accountId: "acc_pay_liab", debit: 205000, credit: 0 },
      { id: uuid(), transactionId: "t_pay_tax", accountId: "acc_bank", debit: 0, credit: 205000 },
    ]
  });

  // F) Utilities
  // Net 20k, VAT 4.6k, Gross 24.6k
  transactions.push({
    id: "t_util",
    date: "2026-01-29",
    description: "Utilities Bill Paid",
    source: "Guided",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_util", accountId: "acc_util", debit: 20000, credit: 0, vatCodeId: "vat_23", vatAmount: 4600 },
      { id: uuid(), transactionId: "t_util", accountId: "acc_vat_in", debit: 4600, credit: 0 },
      { id: uuid(), transactionId: "t_util", accountId: "acc_bank", debit: 0, credit: 24600 },
    ]
  });

  // G) Depreciation
  transactions.push({
    id: "t_dep",
    date: "2026-01-31",
    description: "Jan Depreciation",
    source: "Manual",
    createdAt: new Date().toISOString(),
    lines: [
      { id: uuid(), transactionId: "t_dep", accountId: "acc_dep_exp", debit: 8000, credit: 0 },
      { id: uuid(), transactionId: "t_dep", accountId: "acc_acc_dep", debit: 0, credit: 8000 },
    ]
  });

  return transactions;
};
