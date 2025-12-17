import { Account, Company, Transaction, VatCode } from "./types";
import { addDays, subDays, subMonths, format } from "date-fns";

export const SEED_COMPANY: Company = {
  id: "comp_1",
  name: "Emerald Tech Solutions Ltd",
  currency: "EUR",
  vatRegistered: true,
  country: "IE",
};

export const SEED_VAT_CODES: VatCode[] = [
  { id: "vat_23", code: "S23", description: "Standard Rate", rate: 0.23 },
  { id: "vat_135", code: "R13_5", description: "Reduced Rate", rate: 0.135 },
  { id: "vat_9", code: "SR9", description: "Second Reduced Rate", rate: 0.09 },
  { id: "vat_0", code: "Z0", description: "Zero Rate", rate: 0.00 },
  { id: "vat_exempt", code: "EXEMPT", description: "Exempt", rate: 0.00 },
  { id: "vat_oos", code: "OOS", description: "Outside Scope", rate: 0.00 },
];

export const SEED_ACCOUNTS: Account[] = [
  // Assets
  { id: "acc_1000", code: "1000", name: "Bank Current Account", type: "Asset", isControl: false },
  { id: "acc_1010", code: "1010", name: "Cash", type: "Asset", isControl: false },
  { id: "acc_1100", code: "1100", name: "Accounts Receivable", type: "Asset", isControl: true },
  { id: "acc_1200", code: "1200", name: "Prepayments", type: "Asset", isControl: false },
  { id: "acc_1300", code: "1300", name: "VAT Recoverable (Input)", type: "Asset", isControl: true },
  { id: "acc_1500", code: "1500", name: "Fixed Assets - Computer Equipment", type: "Asset", isControl: false },
  { id: "acc_1510", code: "1510", name: "Fixed Assets - Office Equipment", type: "Asset", isControl: false },
  { id: "acc_1590", code: "1590", name: "Accumulated Depreciation", type: "Asset", isControl: true }, // Contra asset

  // Liabilities
  { id: "acc_2000", code: "2000", name: "Accounts Payable", type: "Liability", isControl: true },
  { id: "acc_2100", code: "2100", name: "VAT Payable (Output)", type: "Liability", isControl: true },
  { id: "acc_2200", code: "2200", name: "Payroll Liabilities", type: "Liability", isControl: true },
  { id: "acc_2300", code: "2300", name: "Corporation Tax Payable", type: "Liability", isControl: false },
  { id: "acc_2400", code: "2400", name: "Loans Payable", type: "Liability", isControl: false },

  // Equity
  { id: "acc_3000", code: "3000", name: "Share Capital", type: "Equity", isControl: false },
  { id: "acc_3100", code: "3100", name: "Retained Earnings", type: "Equity", isControl: false },
  { id: "acc_3200", code: "3200", name: "Director Loan Account", type: "Equity", isControl: false },

  // Revenue
  { id: "acc_4000", code: "4000", name: "Sales - Services", type: "Revenue", isControl: false },
  { id: "acc_4010", code: "4010", name: "Sales - Products", type: "Revenue", isControl: false },
  { id: "acc_4900", code: "4900", name: "Other Income", type: "Revenue", isControl: false },

  // Expenses
  { id: "acc_5000", code: "5000", name: "Cost of Sales", type: "Expense", isControl: false },
  { id: "acc_6000", code: "6000", name: "Wages & Salaries", type: "Expense", isControl: false },
  { id: "acc_6010", code: "6010", name: "Employer PRSI", type: "Expense", isControl: false },
  { id: "acc_6100", code: "6100", name: "Rent", type: "Expense", isControl: false },
  { id: "acc_6200", code: "6200", name: "Utilities", type: "Expense", isControl: false },
  { id: "acc_6300", code: "6300", name: "Marketing", type: "Expense", isControl: false },
  { id: "acc_6400", code: "6400", name: "Software & Subscriptions", type: "Expense", isControl: false },
  { id: "acc_6500", code: "6500", name: "Professional Fees", type: "Expense", isControl: false },
  { id: "acc_6600", code: "6600", name: "Travel", type: "Expense", isControl: false },
  { id: "acc_6700", code: "6700", name: "Bank Charges", type: "Expense", isControl: false },
  { id: "acc_6800", code: "6800", name: "Depreciation", type: "Expense", isControl: false },
];

// Helper to create UUIDs (simple version)
const uuid = () => Math.random().toString(36).substring(2, 15);

// Seed Transactions (Last 3 months)
const today = new Date();
const transactions: Transaction[] = [];

// 1. Initial Investment (Equity)
transactions.push({
  id: uuid(),
  date: format(subMonths(today, 3), "yyyy-MM-dd"),
  description: "Initial Share Capital",
  reference: "INC-001",
  source: "Manual",
  createdAt: new Date().toISOString(),
  lines: [
    { id: uuid(), transactionId: "t1", accountId: "acc_1000", debit: 10000, credit: 0 }, // Dr Bank
    { id: uuid(), transactionId: "t1", accountId: "acc_3000", debit: 0, credit: 10000 }, // Cr Share Capital
  ],
});

// 2. Sales Invoices
transactions.push({
  id: uuid(),
  date: format(subDays(today, 45), "yyyy-MM-dd"),
  description: "Web Development Services - Client A",
  reference: "INV-2024-001",
  source: "Guided",
  createdAt: new Date().toISOString(),
  lines: [
    { id: uuid(), transactionId: "t2", accountId: "acc_1100", debit: 1230, credit: 0 }, // Dr AR (Gross)
    { id: uuid(), transactionId: "t2", accountId: "acc_4000", debit: 0, credit: 1000, vatCodeId: "vat_23", vatAmount: 230 }, // Cr Sales (Net)
    { id: uuid(), transactionId: "t2", accountId: "acc_2100", debit: 0, credit: 230 }, // Cr VAT Payable
  ],
});

// 3. Payment Received
transactions.push({
  id: uuid(),
  date: format(subDays(today, 30), "yyyy-MM-dd"),
  description: "Payment for INV-2024-001",
  reference: "PAY-001",
  source: "Guided",
  createdAt: new Date().toISOString(),
  lines: [
    { id: uuid(), transactionId: "t3", accountId: "acc_1000", debit: 1230, credit: 0 }, // Dr Bank
    { id: uuid(), transactionId: "t3", accountId: "acc_1100", debit: 0, credit: 1230 }, // Cr AR
  ],
});

// 4. Supplier Bill (Software)
transactions.push({
  id: uuid(),
  date: format(subDays(today, 20), "yyyy-MM-dd"),
  description: "Monthly Software Subscription",
  reference: "SUB-001",
  source: "Guided",
  createdAt: new Date().toISOString(),
  lines: [
    { id: uuid(), transactionId: "t4", accountId: "acc_6400", debit: 100, credit: 0, vatCodeId: "vat_23", vatAmount: 23 }, // Dr Software (Net)
    { id: uuid(), transactionId: "t4", accountId: "acc_1300", debit: 23, credit: 0 }, // Dr VAT Recoverable
    { id: uuid(), transactionId: "t4", accountId: "acc_2000", debit: 0, credit: 123 }, // Cr AP
  ],
});

// 5. Director Withdrawal (DLA)
transactions.push({
  id: uuid(),
  date: format(subDays(today, 5), "yyyy-MM-dd"),
  description: "Director Cash Withdrawal",
  reference: "DLA-001",
  source: "Guided",
  createdAt: new Date().toISOString(),
  lines: [
    { id: uuid(), transactionId: "t5", accountId: "acc_3200", debit: 500, credit: 0 }, // Dr DLA
    { id: uuid(), transactionId: "t5", accountId: "acc_1000", debit: 0, credit: 500 }, // Cr Bank
  ],
});

export const SEED_TRANSACTIONS = transactions;
